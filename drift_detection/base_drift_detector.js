class BaseDriftDetector {
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

    reset() {
        this.in_concept_change = false
        this.in_warning_zone = false
        this.estimation = 0.0
        this.delay = 0.0
    }

    detected_change() {
        return this.in_concept_change;
    }

    detected_warning_zone() {
        return this.in_warning_zone;
    }

    get_length_estimation() {
        return this.estimation;
    }

    add_element(input_value) {
        throw new TypeError("Must override method");
    }

}

module.exports = BaseDriftDetector;