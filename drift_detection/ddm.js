/**
 * Copyright (c) Jožef Stefan Institute & contributors to the QStream project, 2018.
 * All rights reserved.
 *
 * This source code is licensed under the FreeBSD license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Drift detector - Page-Hinkley test.
 * Author: Klemen Kenda, klemen.kenda@ijs.si
 */

// TODO: What about regression problems? Using the acctual std?

// includes
let BaseDriftDetector = require('./base_drift_detector.js');

/**
 * PageHinkley
 * @extends BaseDriftDetector
 */
class DDM extends BaseDriftDetector {
    /**
     * Drift Detection Method (based on scikit-multiflow implementation)
     *
     * This concept change detection method is based on the PAC learning model premise, that the
     * learner's error rate will decrease as the number of analysed samples increase, as long as
     * the data distribution is stationary.
     *
     * If the algorithm detects an increase in the error rate, that surpasses a calculated threshold,
     * either change is detected or the algorithm will warn the user that change may occur in the
     * near future, which is called the warning zone.
     *
     * The detection threshold is calculated in function of two statistics, obtained when (pi + si)
     * is minimum:
     *   pmin: The minimum recorded error rate.
     *   smin: The minimum recorded standard deviation.
     *
     * At instant i, the detection algorithm uses:
     *   pi: The error rate at instant i.
     *   si: The standard deviation at instant i.
     *
     * The conditions for entering the warning zone and detecting change are as follows:
     *
     *   if pi + si >= pmin + 2 * smin -> Warning zone
     *   if pi + si >= pmin + 3 * smin -> Change detected
     *
     * @param {int}     min_num_instances   The minimum number of instances before detecting change.
     * @param {float}   alpha               The parameter to define the warning zone boundary.
     * @param {float}   beta                The parameter do define the detection drift boundary.
     */
    constructor(min_num_instances = 30, alpha = 2.0, beta = 3.0) {
        super();

        this.min_instances = min_num_instances;
        this.alpha = alpha;
        this.beta = beta;

        this.sample_count = null;
        this.miss_prob = null;
        this.miss_std = null;
        this.miss_prob_sd_min = null;
        this.miss_prob_min = null;
        this.miss_sd_min = null;
        this.reset();
    }

    /**
     * Resets the change detector parameters (in the beginning or after drift detection).
     */
    reset() {
        super.reset();
        this.sample_count = 1;
        this.miss_prob = 1;
        this.miss_std = 0;
        this.miss_prob_sd_min = Number.MAX_VALUE;
        this.miss_prob_min = Number.MAX_VALUE;
        this.miss_sd_min = Number.MAX_SAFE_INTEGER;
    }

    /**
     * Add new element to the statistics.
     * @param {*} prediction Either 0 or 1. This parameter indicates whether the last sample analyzed
     *                       was correctly classified or not. 1 indicates a good classification
     *                       and 0 a wrong classification.
     */
    add_element(prediction) {
        if (this.in_concept_change) this.reset();

        this.miss_prob = this.miss_prob + (prediction - this.miss_prob) / (1.0 * this.sample_count);
        this.miss_std = Math.sqrt(this.miss_prob * (1.0 - this.miss_prob) / this.sample_count);
        this.sample_count++;

        this.estimation = this.miss_prob;
        this.in_concept_change = false;
        this.in_warning_zone = false;
        this.delay = 0;

        if (this.sample_count < this.min_instances) return;

        if (this.miss_prob + this.miss_std <= this.miss_prob_sd_min) {
            this.miss_prob_min = this.miss_prob;
            this.miss_sd_min = this.miss_std;
            this.miss_prob_sd_min = this.miss_prob + this.miss_std;
        };

        // concept change rule
        if ((this.sample_count > this.min_instances) &&
            (this.miss_prob + this.miss_std > this.miss_prob_min + this.beta * this.miss_sd_min))
            this.in_concept_change = true;
        // warning zone rule
        else if (this.miss_prob + this.miss_std > this.miss_prob_min + this.alpha * this.miss_sd_min)
            this.in_warning_zone = true;
        else this.in_warning_zone = false
    }

}

module.exports = DDM;