/** Drift detector abstract class. */
class BaseDriftDetector {
    /**
     * Create drift detector.
     */
    constructor() {
        // nothing really happens here
        if (new.target === BaseDriftDetector) {
            throw new TypeError("Cannot construct BaseDriftDetector instances directly");
        }

        this.in_concept_change = null
        this.in_warning_zone = null
        this.estimation = null
        this.delay = null
    }

    /**
     * Resets the drift detector.
     */
    reset() {
        this.in_concept_change = false
        this.in_warning_zone = false
        this.estimation = 0.0
        this.delay = 0.0
    }

    /**
     * Function for reporting whether drift has been detected.
     *
     * @return {boolean} Returns true if drift has been detected, otherwise false.
     */
    detected_change() {
        return this.in_concept_change;
    }

    /**
     * Function for reporting whether warning zone has been detected.
     *
     * @return {boolean} Returns true if warning zone has been detected, otherwise false.
     */
    detected_warning_zone() {
        return this.in_warning_zone;
    }

    /**
     * Returns length estimation.
     *
     * @return {int} Length estimation.
     */
    get_length_estimation() {
        return this.estimation;
    }

    /**
     * Adding an element to the drift detector.
     * Not implemented in abstract class.
     */
    add_element(input_value) {
        throw new TypeError("Must override method");
    }

}

module.exports = BaseDriftDetector;