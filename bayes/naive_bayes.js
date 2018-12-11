StreamModel = require('../core/stream_model.js')
utils = require('./utils.js')

class BaseNB {
    constructor() {
    }
    predict(X) {
        let jll = this._joint_log_likelihood(X);
        let cla = [];
        for(let i = 0; i < jll.length; i++) {
            for(let j = 0; j < jll[0].length; j++) {
                if(jll[i][j] == Math.max(...jll[i])) {
                    cla.push(this.classes_[j]);
                    break;
                }
            }
            //cla.push(this.classes_[Math.max(...jll)]);
        }
        return (cla);
    }

    predict_log_proba(X) {
        let jll = this._joint_log_likelihood(X);
        let log_prob_x = [];

        for(let i = 0; i < jll.length; i++) {
            log_prob_x.push(utils.logsumexp(jll[i]));
        }
        let log_prob = []
        for(let i = 0; i < log_prob_x.length; i++) {
            log_prob = jll[i].map(function(num) {
                console.log(num - log_prob_x[i])
                return (num - log_prob_x[i]);
            })
        }
        return (log_prob);
    }

    predict_proba(X) {
        let log_prob = this.predict_log_proba(X);
        let prob = []

        for(let i = 0; i < log_prob.length; i++) {
            prob.push(Math.exp(log_prob[i]));
        }

        return prob;
    }
}

class BaseDiscreteNB extends (BaseNB) {

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
            for(let i = 0; i < this.class_count_.length; i++){
                let class_log_ = Math.log(this.class_count_[i]) - Math.log(utils.sum(this.class_count_));
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
            console.log("alpha too small will result in numeric errors, setting alpha =" + _ALPHA_MIN);
            this.alpha = this.alpha.map(function(x) {
                return Math.max(...[x, _ALPHA_MIN]);
            });
        }
        return this.alpha;
    }

    partial_fit(X, y, classes = null, sample_weight = null) {
        //TODO X = check_arry(X)
        let n_features = X[0].length;

        if (utils._check_partial_fit_first_call(this, classes)) {
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
        let Y = utils.label_binarize(y, this.classes_);

        if(X.length != Y.length) {
            throw new Error('Shape of X: ' + X.length + ' and y: ' + Y.length + ' are incompatible.');
        }

        if(sample_weight != null) {
            for(let i = 0; y < sample_weight.length; i++) {
                Y[i] = Y[i].map(function(x) { return x * sample_weight[i]; });
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
        //TODO X, y = check_X_y(X, y, 'csr')
        let n_features = X[0].length;

        let Y = utils.label_binarize(y, utils.unique_labels(y));
        this.classes_ = utils.unique_labels(y);

        if(sample_weight != null) {
            for(let i = 0; y < sample_weight.length; i++) {
                Y[i] = Y[i].map(function(x) { return x * sample_weight[i]; });
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
        return this;
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
                this.feature_count_[i][j] = this.feature_count_[i][j] + utils.dot(utils.transpose(Y), X)[i][j];
            }
        }

        for(let i = 0; i < Y.length; i++) {
            for(let j = 0; j < Y[0].length; j++) {
                this.class_count_[j] = this.class_count_[j] + Y[i][j];
            }
        }
    }

    _update_feature_log_prob(alpha) {
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
                return Math.log(num) - Math.log(smoothed_cc[i]);
            }))
        }
    }

    _joint_log_likelihood(X) {
        let prod = utils.dot(X, utils.transpose(this.feature_log_prob_))
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


//TESTS
let X = [[2, 1, 0, 4, 2, 1, 1, 1, 1, 3, 1, 1, 2, 4, 1, 1, 1, 4, 2, 2, 3, 4,
    4, 1, 2, 0, 0, 1, 2, 4, 0, 2, 3, 4, 3, 3, 4, 1, 1, 3, 3, 4, 2, 2,
    4, 2, 3, 1, 1, 3, 2, 1, 4, 3, 0, 1, 2, 2, 1, 3, 4, 3, 1, 1, 0, 2,
    3, 1, 4, 3, 1, 2, 0, 0, 1, 2, 4, 2, 4, 3, 0, 3, 3, 1, 2, 2, 3, 2,
    3, 3, 1, 2, 4, 4, 4, 2, 1, 1, 0, 4],
   [4, 2, 3, 3, 2, 3, 0, 2, 0, 1, 1, 4, 4, 2, 2, 0, 3, 1, 3, 2, 3, 2,
    2, 2, 3, 0, 4, 4, 2, 4, 0, 3, 1, 1, 3, 3, 0, 2, 0, 0, 0, 1, 3, 0,
    3, 0, 0, 4, 3, 1, 1, 4, 4, 1, 1, 3, 2, 3, 3, 0, 2, 2, 4, 2, 4, 2,
    4, 2, 3, 3, 4, 0, 2, 1, 3, 2, 4, 1, 1, 2, 3, 2, 2, 3, 1, 2, 3, 0,
    3, 2, 4, 2, 4, 3, 4, 1, 1, 3, 4, 1],
   [1, 3, 3, 2, 0, 0, 1, 3, 3, 4, 4, 0, 0, 2, 3, 0, 2, 2, 2, 4, 0, 2,
    4, 4, 3, 2, 2, 4, 4, 1, 4, 3, 0, 0, 3, 4, 1, 0, 0, 1, 1, 4, 4, 0,
    3, 0, 2, 4, 1, 4, 3, 4, 3, 4, 2, 4, 4, 0, 0, 3, 1, 1, 4, 3, 3, 2,
    1, 3, 3, 2, 1, 1, 0, 1, 4, 4, 2, 1, 3, 0, 4, 1, 0, 2, 2, 4, 0, 2,
    3, 1, 1, 4, 1, 2, 2, 2, 0, 4, 4, 4],
   [1, 0, 0, 2, 2, 3, 4, 0, 4, 1, 3, 0, 0, 4, 0, 3, 1, 2, 1, 2, 3, 3,
    1, 4, 4, 4, 2, 3, 4, 2, 4, 2, 4, 1, 3, 0, 4, 1, 3, 3, 2, 1, 1, 4,
    2, 3, 1, 2, 0, 3, 1, 0, 3, 0, 3, 2, 0, 0, 3, 2, 2, 1, 0, 2, 1, 3,
    0, 0, 4, 0, 3, 2, 4, 4, 2, 0, 4, 2, 3, 1, 2, 4, 4, 1, 4, 2, 2, 3,
    0, 0, 4, 2, 0, 0, 0, 2, 4, 3, 3, 4],
   [2, 1, 4, 3, 1, 3, 1, 2, 3, 2, 4, 1, 1, 4, 4, 2, 1, 3, 4, 1, 1, 2,
    0, 1, 4, 4, 1, 0, 0, 1, 3, 2, 2, 1, 4, 1, 3, 4, 3, 2, 3, 4, 0, 0,
    1, 2, 0, 2, 0, 4, 1, 4, 1, 1, 3, 3, 2, 1, 1, 1, 2, 0, 1, 4, 1, 3,
    1, 0, 4, 4, 2, 0, 0, 3, 1, 3, 3, 1, 1, 3, 4, 0, 0, 3, 4, 3, 4, 3,
    1, 4, 1, 3, 4, 0, 4, 4, 1, 3, 4, 3],
   [0, 1, 2, 2, 2, 1, 0, 1, 2, 0, 3, 2, 4, 2, 1, 3, 1, 4, 3, 4, 2, 0,
    3, 4, 4, 2, 2, 3, 1, 3, 1, 3, 1, 4, 1, 1, 2, 3, 2, 0, 2, 2, 1, 3,
    3, 2, 3, 2, 1, 3, 4, 2, 4, 4, 3, 4, 0, 0, 1, 4, 2, 1, 4, 1, 1, 1,
    1, 0, 3, 1, 2, 4, 1, 1, 2, 2, 0, 3, 3, 0, 1, 1, 4, 1, 1, 0, 1, 3,
    3, 0, 0, 3, 2, 1, 0, 2, 1, 3, 4, 2]];

let y = [1, 2, 3, 4, 5, 6];

/* let bay = new MultinomialNB()
bay.fit(X,y)

console.log(bay.predict([X[2], X[3] , X[4]] ) ) */

let y1 = [1,2,3,4,5,6];

let bay2 = new MultinomialNB() 
for(let i = 0; i < y.length ;i++) {
    let X_ = [X[i]];
    let y_ = [y[i]];

    bay2.partial_fit(X_, y_, classes = y1, sample_weight = null);
}

console.log(bay2.predict([X[2], X[1]] ) )
console.log(bay2.predict_proba([X[2]] ) )