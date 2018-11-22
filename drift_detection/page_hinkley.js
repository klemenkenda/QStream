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

// includes
let BaseDriftDetector = require('./base_drift_detector.js');

/**
 * PageHinkley
 * @extends BaseDriftDetector
 */
class PageHinkley extends BaseDriftDetector {
    /**
     * Page Hinkley change detector (based on scikit-multiflow implementation, which is further based on
     * the book - Gamma, Knowledge Discovery from Data Streams, 2013, pp. 76)
     *
     * This change detection method works by computing the observed values and their mean up to the current
     * moment. Page Hinkley won't output warning zone warnings, only change detections. The method works by
     * means of the Page Hinkley test. In general lines it will detect a concept drift if the observed mean
     * at some instant is greater then a threshold value lambda.
     *
     * @param {int}     min_num_instances   The minimum number of instances before detecting change.
     * @param {float}   delta               The delta factor for the Page Hinkley test.
     * @param {int}     lambda              The change detection threshold.
     * @param {float}   alpha               The forgetting factor, used to weight the observed value and the mean.
     */
    constructor(min_num_instances = 30, delta = 0.005, lambda = 50, alpha = 1-0.0001) {
        super();

        this.min_instances = min_num_instances;
        this.delta = delta;
        this.lambda = lambda;
        this.alpha = alpha;

        this.x_mean = null;
        this.sample_count = null;
        this.sum = null;
        this.in_concept_change = null;
        this.reset();
    }

    /**
     * Resets the change detector parameters (in the beginning or after drift detection).
     */
    reset() {
        super.reset();
        this.sample_count = 1;
        this.x_mean = 0.0;
        this.sum = 0.0;
        this.in_concept_change = false;
    }

    /**
     * Add new element to the statistics.
     * @param {numeric} x   The observed value, from which we want to detect the concept change.
     *
     * After calling this method, to verify if the change was detected, one should call the super method
     * detected_change, which returns True if concept drift has been detected and False otherwise.
     */
    add_element(x) {
        if (this.in_concept_change) this.reset();

        this.x_mean = this.x_mean + (x - this.x_mean) / (1.0 * this.sample_count);
        this.sum = this.alpha * this.sum + (x - this.x_mean - this.delta);

        this.sample_count++;

        this.estimation = this.x_mean;
        this.in_concept_change = false;
        this.in_warning_zone = false;

        this.delay = 0;

        if (this.sample_count < this.min_instances) return;

        if (this.sum > this.lambda) this.in_concept_change = true;
    }

}

module.exports = PageHinkley;