const bayes =  require('../bayes/index.js');
const assert = require('assert');

describe('Multinominal Naive Bayes', function(){

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

    it('fit and predict should predict the expected value', function() {
        let learner = new bayes.MultinominalNB();
        learner.fit(X,y);
        assert.equal(3, learner.predict([X[2]])[0]);
        assert.equal(4, learner.predict([X[3]])[0]);
    });

    it('predicted probability should be as expected.', function() {
        let learner = new bayes.MultinominalNB();
        learner.fit(X,y);

        let expected_prob = [2.4e-35, 9.2e-29, 1.0e+00, 3.3e-41, 3.1e-30, 1.4e-28];
        let prob = learner.predict_proba([X[2]])
        
        for (let i = 0; i < prob.length; i++) {
            let log10 = Math.floor(Math.log10(prob[i]));
            let div = log10 < 0 ? Math.pow(10, 1 - log10) : 10;

            assert.equal(Math.round(expected_prob[i] * div), Math.round(prob[i] * div));
        };
    });

    it('partial_fit and predict should predict the expected value', function() {
        let learner = new bayes.MultinominalNB();
        let y1 = [1,2,3,4,5,6,0,7]
        for (let i = 0; i < y.length ;i++) {
            let X_ = [X[i]];
            let y_ = [y[i]];
        
            learner.partial_fit(X_, y_, classes = y1, sample_weight = null);
        };
        assert.equal(3, learner.predict([X[2]])[0]);
        assert.equal(4, learner.predict([X[3]])[0]);
    });

    it('predicted probability should be as expected.', function() {
        let learner = new bayes.MultinominalNB();
        let y1 = [1,2,3,4,5]
        for (let i = 0; i < y.length ;i++) {
            let X_ = [X[i]];
            let y_ = [y[i]];
        
            learner.partial_fit(X_, y_, classes = y1, sample_weight = null);
        };
        let expected_prob = [2.4e-35, 9.2e-29, 1.0e+00, 3.3e-41, 3.1e-30, 1.4e-28];
        let prob = learner.predict_proba([X[2]])
        
        for (let i = 0; i < prob.length; i++) {
            let log10 = Math.floor(Math.log10(prob[i]));
            let div = log10 < 0 ? Math.pow(10, 1 - log10) : 10;

            assert.equal(Math.round(expected_prob[i] * div), Math.round(prob[i] * div));
        };
    });
});

describe('Gaussian Naive Bayes', function(){
    let X = [[-1, -1], [-2, -1], [-3, -2], [1, 1], [2, 1], [3, 2]];
    let X2 = [[-1, -0], [-2, -4], [-3, -3], [-1, -3], [-2, -1], [-3, -2]];
    let y = [1, 1, 1, 2, 2, 2];
    let y2 = [2, 2, 2, 2, 2, 2];

    it('fit and predict should predict the expected value', function(){
        let learner = new bayes.GaussianNB();
        learner.fit(X,y);
        assert.equal(1, learner.predict([[-1, -3]])[0]);
        assert.equal(2, learner.predict([[1, 1]])[0]);
    });

    it('partial_fit and predict should predict the expected value', function(){
        let learner = new bayes.GaussianNB();
        learner.partial_fit(X, y, [1, 2]);
        assert.equal(1, learner.predict([[-1, -3]])[0]);
        assert.equal(2, learner.predict([[1, 1]])[0]);

        learner.partial_fit(X2, y2);
        assert.equal(2, learner.predict([[-1, -3]])[0]);
        assert.equal(2, learner.predict([[1, 1]])[0]);
    });
});
