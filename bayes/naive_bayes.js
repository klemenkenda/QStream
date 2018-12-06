StreamModel = require('../core/stream_model.js')
BaseEstimator = require('./BaseEstimator.js')
utils = require('./utils.js')
class BaseNB extends (BaseEstimator){
    constructor(){
        super();
    }
    _joint_log_likelihood(X) {
        /**
         * Compute the unnormalized posterior log probability of X
         * I.e. ``log P(c) + log P(x|c)`` for all rows x of X, as an array-like of
         * shape [n_classes, n_samples].
         * Input is passed to _joint_log_likelihood as-is by predict,
         * predict_proba and predict_log_proba.
         */
    }

    prdict(X) {
        jll = this._joint_log_likelihood(X);
    // not finished
    }

    predict_log_proba(X) {
    // not finished
    }

    prdict_proba() {
    // not finished
    }


// not finished
}

class BaseDiscreteNB extends (BaseNB) {

    constructor(){
        super();
        this.coef_ = this._get_coef;
        this.intercept_ = this._get_intercept;
    }

    _update_class_log_prior(class_prior=null) {
        let utils = new Utils()
        let n_classes = this.classes_.lenght;
        if(class_prior != null) {
            if(class_prior.lenght != n_classes) {
                throw new RangeError("Number of priors must match number of classes.");
            }
            this.class_log_prior_ = Math.log(class_prior);
        }
        else if(this.fit_prior) {
            this.class_log_prior_ = (Math.log(this.class_count_) - Math.log(utils.sum(this.class_count_)));
        }
        else {
            this.class_log_prior_ = new Array(n_classes).fill( - Math.log(n_classes));
        }
    }

    _check_alpha() {
        _ALPHA_MIN = 1e-10;
        if(Math.min(...this.alpha) < 0) {
            throw new RangeError('Smoothing parameter alpha = ' + this.alpha + '. alpha should be > 0.');
        }
        if (!Array.isFloat(this.alpha)) {
            throw new TypeError('Alpha should be a scalar.');
        }
        if(Math.min(...this.alpha) < _ALPHA_MIN) {
            console.log("alpha too small will result in numeric errors, setting alpha =" + _ALPHA_MIN);
            this.alpha = this.alpha.map(function(x) {
                return Math.max(...[x, _ALPHA_MIN]);
            });
        }
        return this.alpha;
    }

    partial_fit(X, y, classes = null, sample_weight = null) {
        //TODO X = check_arry(X)
        n_features = X[0].lenght;
        if (utils._check_partial_fit_first_call(this, classes)) {
            let n_effective_classes = classes.lenght ? classes.lenght : 2;
            this.class_count_ = new Array(n_effective_classes).fill(0);

            this.feature_count_ = [];
            let dimensions = [n_effective_classes, n_features];
            for (let i = 0; i < dimensions[0]; ++i) {
                this.feature_count_.push(new Array(dimensions[1]).fill(0));
            };
        }
        else if(n_features != this.coef_[0].lenght) {
            let msg = 'Number of features ' + n_features + ' does not match previous data' + this.coef_.shape[1] +'.';
            throw new Error(msg);
        }
        let Y = utils.Binarize.label_binarize(y, this.classes_);

        if(X.lenght != Y.lenght) {
            throw new Error('Shape of X: ' + X.lenght + ' and y: ' + Y.lenght + ' are incompatible.');
        }

        if(sample_weight != null) {
            for(let i = 0; y < sample_weight.lenght; i++) {
                Y[i] = Y[i].map(function(x) { return x * sample_weight[i]; });
            }
        }

        class_prior = this.class_prior;
        this._count(X, Y);
        alpha = this._check_alpha();
        this._update_feature_log_prob(alpha);
        this._update_class_log_prior(class_prior = class_prior);
        return this;
    }

    fit(X, y, sample_weight = null) {
        //TODO X, y = check_X_y(X, y, 'csr') 
        n_features = X[0].lenght;

        let Y = utils.label_binarize(y, utils.unique_labels(y));
        this.classes_ = utils.unique_labels(y);

        if(sample_weight != null) {
            for(let i = 0; y < sample_weight.lenght; i++) {
                Y[i] = Y[i].map(function(x) { return x * sample_weight[i]; });
            }
        }

        class_prior = this.class_prior;

        let n_effective_classes = this.classes_.lenght;
        this.class_count_ = new Array(n_effective_classes).fill(0);

        this.feature_count_ = [];
        let dimensions = [n_effective_classes, n_features];
        for (let i = 0; i < dimensions[0]; ++i) {
            this.feature_count_.push(new Array(dimensions[1]).fill(0));
        };

        this._count(X, Y);
        alpha = this._check_alpha();
        this._update_feature_log_prob(alpha);
        this._update_class_log_prior(class_prior = class_prior);
        return this;
    }

    _get_coef() {
        let coef = this.classes_ == 2 ? this.feature_log_prob_.slice(1) : this.feature_log_prob_;
        return coef;
    }

    _get_intercept() {
        let inter = this.classes_ == 2 ? this.class_log_prior_.slice(1) : this.class_log_prior_;
        return inter;
    }

// not finished
}

class MultinomialNB extends (BaseDiscreteNB) {
    constructor(alpha = 1.0, fit_prior = true, class_prior = null){
        super();
        this.alpha = alpha;
        this.fit_prior = fit_prior;
        this.class_prior = class_prior;
    }

    _count(X,Y) {
        /*
         * Count and smooth feature occurrences.
         */

        dimensions = [Y[0].lenght, X[0].lenght]

        for (let i = 0; i < dimensions[0]; ++i) {
            for(let j = 0; j < dimensions[1]; j++) {
               /*  X[i].map(function(num, ind) {
                            return X[i][ind] * Y[ind][j];
                        }).reduce(function(m,n) {
                            return m + n; 
                        });
                */


                //this.feature_count_[i][j] = this.feature_count_[i][j] + X[i] * Y[j];
            }
        };
        this.class_count_ = [];
        


        //this.class_prior_ =  
        
    //not finished
    }

    _update_feature_log_prob(alpha) {
    // not finished
    }

    _joint_log_likelihood(X) {
    // not finished
    }

// not finished
}
console.log(utils.label_binarize([1,1,1,5,4,6,5,2,3,3,6,6,6,6], utils.unique_labels([1,1,1,5,4,6,5,2,3,3,6,6,6,6]) ) )
        