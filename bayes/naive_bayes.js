StreamModel = require('../core/stream_model.js')
utils = require('../utils/utils.js')

class BaseNB {
    /**
     * Abstract base class for naive Bayes estimators.
     */
    constructor() {
    }
    predict(X) {
        /**
         * Perform classification on an array of test vectors X.
         * 
         * @param {array} X
         * @returns Predicted target values for X.
         */
        let jll = this._joint_log_likelihood(X);
        let cla = [];
        for(let i = 0; i < jll.length; i++) {
            for(let j = 0; j < jll[0].length; j++) {
                if(jll[i][j] == Math.max(...jll[i])) {
                    cla.push(this.classes_[j]);
                    break;
                }
            }
        }
        return (cla);
    }

    predict_log_proba(X) {
        /**
         * Return log-probability estimates for the test vector X.
         * @param {array} X
         * @returns Returns the log-probability of the samples for each class in
         *          the model. The columns correspond to the classes in sorted
         *          order, as they appear in the attribute `classes_`.
         */
        let jll = this._joint_log_likelihood(X);
        let log_prob_x = [];

        for(let i = 0; i < jll.length; i++) {
            log_prob_x.push(utils.BayesUtils.logsumexp(jll[i]));
        }
        let log_prob = []
        for(let i = 0; i < log_prob_x.length; i++) {
            log_prob = jll[i].map(function(num) {
                return (num - log_prob_x[i]);
            })
        }
        return (log_prob);
    }

    predict_proba(X) {
        /**
         * Return probability estimates for the test vector X.
         * @param {array} X
         * @returns Returns the probability of the samples for each class in
         *          the model. The columns correspond to the classes in sorted
         *          order, as they appear in the attribute `classes_`.
         */
        let log_prob = this.predict_log_proba(X);
        let prob = []

        for(let i = 0; i < log_prob.length; i++) {
            prob.push(Math.exp(log_prob[i]));
        }

        return (prob);
    }
}

class BaseDiscreteNB extends (BaseNB) {
    /**
     * Abstract base class for naive Bayes on discrete/categorical data.
     */
    constructor() {
        super();
    }

    _update_class_log_prior(class_prior = null) {
        let n_classes = this.classes_.length;
        if(class_prior != null) {
            if(class_prior.length != n_classes) {
                throw new Error("Number of priors must match number of classes.");
            }
            this.class_log_prior_ = Math.log(class_prior);
        }
        else if(this.fit_prior) {
            this.class_log_prior_ = [];
            for(let i = 0; i < this.class_count_.length; i++) {
                let class_log_ = Math.log(this.class_count_[i]) - Math.log(utils.BayesUtils.sum(this.class_count_));
                this.class_log_prior_.push(class_log_);
            }
        }
        else {
            this.class_log_prior_ = new Array(n_classes).fill( - Math.log(n_classes));
        }
    }

    _check_alpha() {
        let _ALPHA_MIN = 1e-10;
        if(Math.min(this.alpha) < 0) {
            throw new Error('Smoothing parameter alpha = ' + this.alpha + '. alpha should be > 0.');
        }
        if (Number(this.alpha) !== this.alpha) {
            throw new Error('Alpha should be a scalar.');
        }
        if(Math.min(this.alpha) < _ALPHA_MIN) {
            //warning
            //console.log("alpha too small will result in numeric errors, setting alpha =" + _ALPHA_MIN);
            this.alpha = this.alpha.map(function(x) {
                return (Math.max(...[x, _ALPHA_MIN]));
            });
        }
        return (this.alpha);
    }

    partial_fit(X, y, classes = null, sample_weight = null) {
        /**Incremental fit on a batch of samples.
         * This method is expected to be called several times consecutively
         * on different chunks of a dataset so as to implement out-of-core
         * or online learning.
         * This is especially useful when the whole dataset is too big to fit in
         * memory at once.
         * This method has some performance overhead hence it is better to call
         * partial_fit on chunks of data that are as large as possible
         * (as long as fitting in the memory budget) to hide the overhead.
         * 
         * Incremental fit on a batch of samples.
         * This method is expected to be called several times consecutively
         * on different chunks of a dataset so as to implement out-of-core
         * or online learning.
         * This is especially useful when the whole dataset is too big to fit in
         * memory at once.
         * This method has some performance overhead hence it is better to call
         * partial_fit on chunks of data that are as large as possible
         * (as long as fitting in the memory budget) to hide the overhead.
         * 
         * @param {array} X Training vectors.
         * @param {array} y Target values.
         * @param {array} classes List of all the classes that can possibly appear in the y vector.
         *                        Must be provided at the first call to partial_fit, can be omitted
         *                        in subsequent calls.
         * @param {array} sample_weight Weights applied to individual samples (1. for unweighted).
         * 
         * @returns {this : object}
         */
        //TODO X = check_arry(X)
        let n_features = X[0].length;

        if (utils.BayesUtils._check_partial_fit_first_call(this, classes)) {
            let n_effective_classes = classes.length ? classes.length : 2;
            this.class_count_ = new Array(n_effective_classes).fill(0);

            this.feature_count_ = [];
            let dimensions = [n_effective_classes, n_features];
            for (let i = 0; i < dimensions[0]; ++i) {
                this.feature_count_.push(new Array(dimensions[1]).fill(0));
            };
        }
        /*
        else if(n_features != this.coef_[0].length) {
            let msg = 'Number of features ' + n_features + ' does not match previous data' + this.coef_.shape[1] +'.';
            throw new Error(msg);
        } */
        let Y = utils.BayesUtils.label_binarize(y, this.classes_);

        if(X.length != Y.length) {
            throw new Error('Shape of X: ' + X.length + ' and y: ' + Y.length + ' are incompatible.');
        }

        if(sample_weight != null) {
            for(let i = 0; y < sample_weight.length; i++) {
                Y[i] = Y[i].map(function(x) { return (x * sample_weight[i]); });
            }
        }

        let class_prior = this.class_prior;
        this._count(X, Y);
        let alpha = this._check_alpha();
        this._update_feature_log_prob(alpha);
        this._update_class_log_prior(class_prior);
        return (this);
    }

    fit(X, y, sample_weight = null) {
        /**
         * Fit Naive Bayes classifier according to X, y.
         * 
         * @param {array} X Training vectors.
         * @param {array} y Target values.
         * @param {array} sample_weight Weights applied to individual samples (1. for unweighted).
         * 
         * @returns {this : object}
         * 
         */
        //TODO X, y = check_X_y(X, y, 'csr')
        let n_features = X[0].length;

        let Y = utils.BayesUtils.label_binarize(y, utils.BayesUtils.unique_labels(y));
        this.classes_ = utils.BayesUtils.unique_labels(y);

        if(sample_weight != null) {
            for(let i = 0; y < sample_weight.length; i++) {
                Y[i] = Y[i].map(function(x) { return (x * sample_weight[i]); });
            }
        }

        let class_prior = this.class_prior;

        let n_effective_classes = this.classes_.length;
        this.class_count_ = new Array(n_effective_classes).fill(0);

        this.feature_count_ = [];
        let dimensions = [n_effective_classes, n_features];
        for (let i = 0; i < dimensions[0]; ++i) {
            this.feature_count_.push(new Array(dimensions[1]).fill(0));
        };

        this._count(X, Y);
        let alpha = this._check_alpha();
        this._update_feature_log_prob(alpha);
        this._update_class_log_prior(class_prior);
        return (this);
    }

/*     _get_coef() {
        let coef = this.classes_ == 2 ? this.feature_log_prob_.slice(1) : this.feature_log_prob_;
        return coef;
    }

    _get_intercept() {
        let inter = this.classes_ == 2 ? this.class_log_prior_.slice(1) : this.class_log_prior_;
        return inter;
    } */
}

class MultinomialNB extends (BaseDiscreteNB) {
    /**
     * Naive Bayes classifier for multinomial models
     * The multinomial Naive Bayes classifier is suitable for classification with
     * discrete features (e.g., word counts for text classification). The
     * multinomial distribution normally requires integer feature counts. However,
     * in practice, fractional counts such as tf-idf may also work.
     *
     * @param {float} alpha Additive (Laplace/Lidstone) smoothing parameter
     *                      (0 for no smoothing).
     * @param {boolean} fit_prior boolean, optional (default=True)
     *                            Whether to learn class prior probabilities or not.
     *                            If false, a uniform prior will be used.
     * @param {array} class_prior Prior probabilities of the classes. If specified the priors are not
     *                            adjusted according to the data.
     */
    constructor(alpha = 1.0, fit_prior = true, class_prior = null) {
        super();
        this.alpha = alpha;
        this.fit_prior = fit_prior;
        this.class_prior = class_prior;
    }

    _count(X,Y) {
        /*
         * Count and smooth feature occurrences.
         */
        // TODO
        // if np.any((X.data if issparse(X) else X) < 0):
        // raise ValueError("Input X must be non-negative")

        for(let i = 0; i < this.feature_count_.length; i++) {
            for(let j = 0; j < this.feature_count_[0].length; j++) {
                this.feature_count_[i][j] = this.feature_count_[i][j] + utils.BayesUtils.dot(utils.BayesUtils.transpose(Y), X)[i][j];
            }
        }

        for(let i = 0; i < Y.length; i++) {
            for(let j = 0; j < Y[0].length; j++) {
                this.class_count_[j] = this.class_count_[j] + Y[i][j];
            }
        }
    }

    _update_feature_log_prob(alpha) {
        /*
         * Apply smoothing to raw counts and recompute log probabilities
         */
        let smoothed_fc = this.feature_count_.map(function(arr) {
            return arr.map(function(num) {
                return (num + alpha);
            });
        });
        let smoothed_cc = new Array(smoothed_fc.length).fill(0);
        for(let i = 0; i < smoothed_fc.length; i++) {
            smoothed_cc[i] =  smoothed_fc[i].reduce((a,b) => a + b);
        }
        this.feature_log_prob_ = [];

        for(let i = 0; i < smoothed_fc.length; i++) {
            this.feature_log_prob_.push(smoothed_fc[i].map(function(num) {
                return (Math.log(num) - Math.log(smoothed_cc[i]));
            }))
        }
    }

    _joint_log_likelihood(X) {
        /*
         * Calculate the posterior log probability of the samples X.
         */
        let prod = utils.BayesUtils.dot(X, utils.BayesUtils.transpose(this.feature_log_prob_))
        let ret = [];

        let dimensions = [prod.length, prod[0].length];
        for (let i = 0; i < dimensions[0]; ++i) {
            ret.push(new Array(dimensions[1]).fill(0));
        }

        for(let i = 0; i < ret.length; i++) {
            for(let j = 0; j < ret[0].length; j++) {
                ret[i][j] = prod[i][j] + this.class_log_prior_[j];
            }
        }
        return (ret);
    }
}
module.exports = MultinomialNB;