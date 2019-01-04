StreamModel = require('../core/stream_model.js')
utils = require('../utils/index.js')

class BaseNB {
    /**
     * Abstract base class for naive Bayes estimators.
     */
    constructor() {
    };

    /**
     * Perform classification on an array of test vectors X.
     * 
     * @param {array} X array of feature arrays.
     * @returns {array} Predicted target values for X.
     */
    predict(X) {
        let jll = this._joint_log_likelihood(X);
        let cla = [];
        // loop through jll arrays and find max value of each
        for (let i = 0; i < jll.length; i++) {
            for (let j = 0; j < jll[0].length; j++) {
                if (jll[i][j] == Math.max(...jll[i])) {
                    cla.push(this.classes_[j]);
                    break;
                };
            };
        };
        return (cla);
    };

    /**
     * Return log-probability estimates for the test vector X.
     * @param {array} X array of feature arrays.
     * @returns {array} Returns the log-probability of the samples for each class in
     *          the model. The columns correspond to the classes in sorted
     *          order, as they appear in the attribute `classes_`.
     */
    predict_log_proba(X) {
        let jll = this._joint_log_likelihood(X);
        let log_prob_x = [];

        for (let i = 0; i < jll.length; i++) {
            log_prob_x.push(utils.Bayes.logsumexp(jll[i]));
        };
        let log_prob = []
        for (let i = 0; i < log_prob_x.length; i++) {
            log_prob = jll[i].map(function(num) {
                return (num - log_prob_x[i]);
            })
        };
        return (log_prob);
    };

    /**
     * Return probability estimates for the test vector X.
     * @param {array} X array of feature arrays.
     * @returns {array} Returns the probability of the samples for each class in
     *          the model. The columns correspond to the classes in sorted
     *          order, as they appear in the attribute `classes_`.
     */
    predict_proba(X) {

        let log_prob = this.predict_log_proba(X);
        let prob = []

        for (let i = 0; i < log_prob.length; i++) {
            prob.push(Math.exp(log_prob[i]));
        };

        return (prob);
    };
};

class BaseDiscreteNB extends BaseNB {
    /**
     * Abstract base class for naive Bayes on discrete/categorical data.
     */
    constructor() {
        super();
    };
    /* _update_class_log_prior()
     * It updates this.class_log_prior
     */
    _update_class_log_prior(class_prior = null) {
        let n_classes = this.classes_.length;
        if (class_prior != null) {
            if (class_prior.length != n_classes) {
                throw new Error("Number of priors must match number of classes.");
            };
            this.class_log_prior_ = Math.log(class_prior);
        } else if (this.fit_prior) {
            this.class_log_prior_ = [];
            for (let i = 0; i < this.class_count_.length; i++) {
                let class_log_ = Math.log(this.class_count_[i]) - Math.log(utils.Bayes.sum(this.class_count_));
                this.class_log_prior_.push(class_log_);
            };
        } else {
            this.class_log_prior_ = new Array(n_classes).fill( - Math.log(n_classes));
        };
    };

    /* _check_alpha()
     * It checks if alpha is biger than 0, if it is scalar and higher than _ALPHA_MIN
     */
    _check_alpha() {
        let _ALPHA_MIN = 1e-10;
        if (Math.min(this.alpha) < 0) {
            throw new Error('Smoothing parameter alpha = ' + this.alpha + '. alpha should be > 0.');
        };
        if (Number(this.alpha) !== this.alpha) {
            throw new Error('Alpha should be a scalar.');
        };
        if (Math.min(this.alpha) < _ALPHA_MIN) {
            //warning
            //console.log("alpha too small will result in numeric errors, setting alpha =" + _ALPHA_MIN);
            this.alpha = this.alpha.map(function(x) {
                return (Math.max(...[x, _ALPHA_MIN]));
            });
        };
        return (this.alpha);
    };

    /** partial_fit()
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
     */
    partial_fit(X, y, classes = null, sample_weight = null) {
        //TODO X = check_arry(X)
        let n_features = X[0].length;

        if (utils.Bayes._check_partial_fit_first_call(this, classes)) {
            let n_effective_classes = classes.length ? classes.length : 2;
            this.class_count_ = new Array(n_effective_classes).fill(0);

            this.feature_count_ = [];
            let dimensions = [n_effective_classes, n_features];
            for (let i = 0; i < dimensions[0]; ++i) {
                this.feature_count_.push(new Array(dimensions[1]).fill(0));
            };
        };

        let Y = utils.Bayes.label_binarize(y, this.classes_);
        if (X.length != Y.length) {
            throw new Error('Shape of X: ' + X.length + ' and y: ' + Y.length + ' are incompatible.');
        };

        if (sample_weight != null) {
            for (let i = 0; y < sample_weight.length; i++) {
                Y[i] = Y[i].map(function(x) { return (x * sample_weight[i]); });
            };
        };

        let class_prior = this.class_prior;
        this._count(X, Y);
        let alpha = this._check_alpha();
        this._update_feature_log_prob(alpha);
        this._update_class_log_prior(class_prior);
    };

    /** fit()
     * 
     * Fit Naive Bayes classifier according to X, y.
     * 
     * @param {array} X Training vectors.
     * @param {array} y Target values.
     * @param {array} sample_weight Weights applied to individual samples (1. for unweighted).
     * 
     */
    //TODO X, y = check_X_y(X, y, 'csr')
    fit(X, y, sample_weight = null) {
        let n_features = X[0].length;

        let Y = utils.Bayes.label_binarize(y, utils.Bayes.unique(y));
        this.classes_ = utils.Bayes.unique(y);

        if (sample_weight != null) {
            for (let i = 0; y < sample_weight.length; i++) {
                Y[i] = Y[i].map(function(x) { return (x * sample_weight[i]); });
            };
        };

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
    };
};

class MultinomialNB extends BaseDiscreteNB {
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
    };

    /*
     * Count and smooth feature occurrences.
     */
    _count(X,Y) {
        // TODO
        // if np.any((X.data if issparse(X) else X) < 0):
        // raise ValueError("Input X must be non-negative")

        for (let i = 0; i < this.feature_count_.length; i++) {
            for (let j = 0; j < this.feature_count_[0].length; j++) {
                this.feature_count_[i][j] = this.feature_count_[i][j] + utils.Bayes.dot(utils.Bayes.transpose(Y), X)[i][j];
            };
        };

        for (let i = 0; i < Y.length; i++) {
            for (let j = 0; j < Y[0].length; j++) {
                this.class_count_[j] = this.class_count_[j] + Y[i][j];
            };
        };
    };

    /*
     * Apply smoothing to raw counts and recompute log probabilities
     */
    _update_feature_log_prob(alpha) {
        let smoothed_fc = this.feature_count_.map(function(arr) {
            return arr.map(function(num) {
                return (num + alpha);
            });
        });
        let smoothed_cc = new Array(smoothed_fc.length).fill(0);
        for (let i = 0; i < smoothed_fc.length; i++) {
            smoothed_cc[i] =  smoothed_fc[i].reduce((a,b) => a + b);
        };
        this.feature_log_prob_ = [];

        for (let i = 0; i < smoothed_fc.length; i++) {
            this.feature_log_prob_.push(smoothed_fc[i].map(function(num) {
                return (Math.log(num) - Math.log(smoothed_cc[i]));
            }))
        };
    };

    /*
     * Calculate the posterior log probability of the samples X.
     */
    _joint_log_likelihood(X) {
        //TODO check_is_fitted();
        // check_array()
        let prod = utils.Bayes.dot(X, utils.Bayes.transpose(this.feature_log_prob_))
        let ret = [];

        let dimensions = [prod.length, prod[0].length];
        for (let i = 0; i < dimensions[0]; ++i) {
            ret.push(new Array(dimensions[1]).fill(0));
        };

        for (let i = 0; i < ret.length; i++) {
            for (let j = 0; j < ret[0].length; j++) {
                ret[i][j] = prod[i][j] + this.class_log_prior_[j];
            };
        };
        return (ret);
    };
};
module.exports.MultinomialNB = MultinomialNB;

class GaussianNB extends BaseNB {
    /**
     * Gaussian Naive Bayes (GaussianNB)
     * Can perform online updates to model parameters via `partial_fit` method.
     * 
     * @param {array} priors 
     * @param {float} var_smoothing 
     */
    constructor (priors = null, var_smoothing = 1e-9) {
        super();
        this.priors = priors;
        this.var_smoothing = var_smoothing;
    };

    /** fit()
     * 
     * Fit Gaussian Naive Bayes according to X, y
     * 
     * @param {array} X Training vectors
     * @param {array} y Target values.
     * @param {array} sample_weight Weights applied to individual samples (1. for unweighted).
     */
    fit(X,y,sample_weight = null) {
        return (this._partial_fit(X, y, utils.Bayes.unique(y), true, sample_weight));
    };

    /** _update_mean_variance()
     * 
     * Compute online update of Gaussian mean and variance.
     * Given starting sample count, mean, and variance, a new set of
     * points X, and optionally sample weights, return the updated mean and
     * variance.
     * 
     * @param {int} n_past Number of samples represented in old mean and variance. If sample
     *                     weights were given, this should contain the sum of sample
     *                     weights represented in old mean and variance.
     * @param {array} mu Means for Gaussians in original set.
     * @param {array} vari Variances for Gaussians in original set.
     * @param {array} X New data set.
     * @param {array} sample_weight Weights applied to individual samples (1. for unweighted).
     */
    _update_mean_variance(n_past, mu, vari, X, sample_weight = null) {
        if (X.length == 0) {
            return ([mu, vari]);
        }

        let n_new = null;
        let new_vari = [];
        let new_mu = [];

        if (sample_weight != null) {
            //TODO
            throw new Error("Not implemented for sample_weight != null.");
        } else {
            n_new = X.length;
            let X_t = utils.Bayes.transpose(X);
            for (let i = 0; i < X_t.length; i++) {
                new_vari.push(utils.Bayes.variance(X_t[i]));
                new_mu.push(utils.Bayes.mean(X_t[i]))
            };
        };

        if (n_past == 0) {
            return ([new_mu, new_vari]);
        };

        let n_total = n_past + n_new;

        let total_mu = [];
        let total_vari = [];
        for (let i = 0; i < X[0].length; i++) {
            total_mu.push((n_new * new_mu[i] + n_past * mu[i]) / n_total);

            let old_ssd = n_past * vari[i];
            let new_ssd = n_new * new_vari[i];

            let total_ssd = (old_ssd + new_ssd + (n_past / (n_new * n_total)) * Math.pow((n_new * mu[i] - n_new * new_mu[i]), 2));
            total_vari.push(total_ssd / n_total);
        }
        return ([total_mu, total_vari]);
    };

    /** partial_fit()
     * 
     * Incremental fit on a batch of samples.
     * This method is expected to be called several times consecutively
     * on different chunks of a dataset so as to implement out-of-core
     * or online learning.
     * This is especially useful when the whole dataset is too big to fit in
     * memory at once.
     * This method has some performance and numerical stability overhead,
     * hence it is better to call partial_fit on chunks of data that are
     * as large as possible (as long as fitting in the memory budget) to
     * hide the overhead.
     *
     * @param {array} X Training vectors.
     * @param {array} y Target values.
     * @param {array} classes List of all the classes that can possibly appear in the y vector.
     *                        Must be provided at the first call to partial_fit, can be omitted
     *                        in subsequent calls.
     * @param {array} sample_weight Weights applied to individual samples (1. for unweighted).
     */
    partial_fit(X, y, classes = null, sample_weight = null) {
        return (this._partial_fit(X, y, classes, false, sample_weight));        
    }

    /** _partial_fit()
     * 
     * Actual implementation of Gaussian NB fitting.
     * 
     * @param {array} X Training vectors.
     * @param {array} y Target values.
     * @param {array} classes List of all the classes that can possibly appear in the y vector.
     *                        Must be provided at the first call to partial_fit, can be omitted
     *                        in subsequent calls.
     * @param {bool} _refit If true, act as though this were the first time we called
     *                      _partial_fit (ie, throw away any past fitting and start over).
     * @param {array} sample_weight Weights applied to individual samples (1. for unweighted).
     */
    _partial_fit(X, y, classes = null, _refit=false, sample_weight = null) {
        let X_t = utils.Bayes.transpose(X);
        let vari = [];
        for (let i = 0; i < X_t.length; i++) {
            vari.push(utils.Bayes.variance(X_t[i]));
        };
        this.epsilon_ = this.var_smoothing * Math.max(...vari);

        if (_refit) {
            this.classes_ = null;
        };
        if (utils.Bayes._check_partial_fit_first_call(this, classes)) {
            let n_features = X[0].length;
            let n_classes = this.classes_.length;
            this.theta_ = [];
            this.sigma_ = []
            let dimensions = [n_classes, n_features];
            for (let i = 0; i < dimensions[0]; ++i) {
                this.theta_.push(new Array(dimensions[1]).fill(0));
                this.sigma_.push(new Array(dimensions[1]).fill(0));
            };
            this.class_count_ = Array(n_classes).fill(0);
            
            if (this.priors != null){
                //TODO some checks for priors
                this.class_prior = priors;
            } else {
                this.class_prior_ = Array(this.classes_.length).fill(0);
            };
        } else {
            if (X[0].length != this.theta_[0].length) {
                let msg = "Number of features does not match previous data.";
                throw new Error(msg);
            };
            for (let i = 0; i < this.sigma_.length; i++) {
                let epsilon = this.epsilon_;
                this.sigma_[i] = this.sigma_[i].map(function(num) {
                    return (num - epsilon);
                });
            };
        };
        classes = this.classes_;

        let unique_y = utils.Bayes.unique(y);
        //TODO check if unique y has more samples than classes.

        for (let j = 0; j < unique_y.length; j++) {
            let i = classes.indexOf(unique_y[j]);
            let X_i = [];

            for(let k = 0 ; k < y.length; k++) {
                if (y[k] == unique_y[j]) {
                    X_i.push(X[k]);
                };
            };

            let sw_i = null;
            let N_i = null;
            if (sample_weight != null) {
                //TODO
                throw new Error("Not implemented for sample_weight != null.");
            } else {
                sw_i = null;
                N_i = X_i.length;
            };

            let update_mean_variance = this._update_mean_variance(this.class_count_[i], this.theta_[i], this.sigma_[i], X_i, sw_i);
            let new_theta = update_mean_variance[0];
            let new_sigma = update_mean_variance[1];
            
            this.theta_[i] = new_theta;
            this.sigma_[i] = new_sigma;
            this.class_count_[i] = this.class_count_[i] + N_i;
            };

        for (let i = 0; i < this.sigma_.length; i++) {
            let epsilon = this.epsilon_
            this.sigma_[i] = this.sigma_[i].map(function(num) {
                return (num + epsilon);
            });
        };
        this.sigma_
        if (this.priors == null) {
            let class_count_ = this.class_count_;
            this.class_prior_ = this.class_count_.map(function(num) {
                return (num / utils.Bayes.sum(class_count_));
            });
        };
    };

    /*
     * Calculate the posterior log probability of the samples X.
     */
    _joint_log_likelihood(X) {
        //TODO check_is_fitted();
        // check_array()
        let joint_log_likelihood_ = []
        for (let k = 0; k < X.length; k++) {
            let joint_log_likelihood = [];
            for (let i = 0; i < this.classes_.length; i++) {
                let jointi = Math.log(this.class_prior_[i]);
                let n_ij = 0;
                for (let j = 0; j < this.sigma_[i].length ; j++) {
                    n_ij = n_ij - 0.5 * Math.log(2 * Math.PI * this.sigma_[i][j]);
                    n_ij = n_ij - 0.5 * (Math.pow((X[k][j] - this.theta_[i][j]), 2)) / (this.sigma_[i][j]);
                };
                joint_log_likelihood.push(jointi + n_ij);
            };
            joint_log_likelihood_.push(joint_log_likelihood)
        };
        return (joint_log_likelihood_);
    };
};
module.exports.GaussianNB = GaussianNB;