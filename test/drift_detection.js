let assert = require('assert');
let { BaseDriftDetector, PageHinkley } = require('../drift_detection/index.js');


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


describe('drift detection', function() {
    describe('base drift detector', function() {
        it('instantiating base detector throws error', function() {
            assert.throws(function() { new BaseDriftDetector() }, Error, "Error thrown.");
        });
    });

    describe('Page-Hinkley drift detection', function() {
        it('instantiating Page-Hinkley detector', function() {
            let ph = new PageHinkley();
        });

        it('detector test - one drift change in proximity of simulated change', function() {
            let ph = new PageHinkley();
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
})