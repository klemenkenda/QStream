let core = require('../core/index.js');
let StreamModel = core.StreamModel;

class HoeffdingTree extends StreamModel {
    /**
     * Hoeffding Tree or VFDT.
     *
     * @param {*} max_byte_size
     * @param {*} memory_estimate_period
     * @param {*} grace_period
     * @param {*} split_criterion
     * @param {*} split_confidence
     * @param {*} tie_threshold
     * @param {*} binary_split
     * @param {*} stop_mem_management
     * @param {*} remove_poor_atts
     * @param {*} no_preprune
     * @param {*} leaf_prediction
     * @param {*} nb_threshold
     * @param {*} nominal_attributes
     */
    constructor(max_byte_size = Number.MAX_SAFE_INTEGER,
        memory_estimate_period = 1000000,
        grace_period = 200,
        split_criterion = 'info_gain',
        split_confidence = 0.0000001,
        tie_threshold = 0.05,
        binary_split = false,
        stop_mem_management = false,
        remove_poor_atts = false,
        no_preprune = false,
        leaf_prediction = 'nba',
        nb_threshold = 0,
        nominal_attributes = null) {

        super();
        this.max_byte_size = max_byte_size;
        this.memory_estimate_period = memory_estimate_period;
        this.grace_period = grace_period;
        this.split_criterion = split_criterion;
        this.split_confidence = split_confidence;
        this.tie_threshold = tie_threshold;
        this.binary_split = binary_split;
        this.stop_mem_management = stop_mem_management;
        this.remove_poor_atts = remove_poor_atts;
        this.no_preprune = no_preprune;
        this.leaf_prediction = leaf_prediction;
        this.nb_threshold = nb_threshold;
        this.nominal_attributes = nominal_attributes;
    }


}

module.exports = HoeffdingTree;