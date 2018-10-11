let assert = require('assert');
let QStream = require('../index.js');

function rand_normal(mu, sigma, nsamples){
    if(!nsamples) nsamples = 6
    if(!sigma) sigma = 1
    if(!mu) mu=0

    let run_total = 0
    for(let i=0 ; i<nsamples ; i++){
       run_total += Math.random()
    }

    return sigma * (run_total - nsamples/2)/(nsamples/2) + mu
}

function random_int(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

describe('drift detection', function() {
    describe('base drift detector', function() {
        it('instantiating base detector throws error', function() {
            assert.throws(function() { new QStream.DriftDetection.BaseDriftDetector() }, Error, "Error thrown.");
        });
    });

    describe('Page-Hinkley drift detection', function() {
        it('instantiating Page-Hinkley detector', function() {
            let ph = new QStream.DriftDetection.PageHinkley();
        });

        it('detector test - one drift change in proximity of simulated change', function() {
            let ph = new QStream.DriftDetection.PageHinkley();
            let changeI = -1;
            let changes = 0;

            for (let i = 0; i < 1000; i++) {
                ph.add_element(rand_normal(1, 1));
                if (ph.detected_change()) {
                    changes++;
                    changeI = i;
                }
            }

            for (let i = 1000; i < 2000; i++) {
                ph.add_element(rand_normal(2, 1));
                if (ph.detected_change()) {
                    changes++;
                    changeI = i;
                }
            }

            assert.equal(changes, 1);
            assert.equal((changeI >= 1001) && (changeI < 1100), true);
        });
    });

    describe('DDM drift detection', function() {
        it('instantiating DDM detector', function() {
            let ph = new QStream.DriftDetection.DDM();
        });

        it('detector test - one drift change in proximity of simulated change', function() {
            let ddm = new QStream.DriftDetection.DDM();
            let changeI = -1;
            let warningI = -1;
            let changes = 0;
            let warnings = 0;

            // create the data
            let data = [];
            for (let i = 0; i < 2000; i++) {
                data.push(random_int(0, 2));
            }

            for (let i = 1000; i < 1500; i++) {
                data[i] = 1;
            }

            for (let i = 0; i < 2000; i++) {
                ddm.add_element(data[i]);
                if (ddm.detected_warning_zone()) {
                    warnings++;
                    warningI = i;
                }
                if (ddm.detected_change()) {
                    changes++;
                    changeI = i;
                }
            }

            assert.equal(changes, 1);
            assert.equal((changeI >= 1001) && (changeI < 1100), true);
        });
    });
})