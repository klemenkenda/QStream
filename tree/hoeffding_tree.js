let core = require('../core/index.js');
let StreamModel = core.StreamModel;

class HoeffdingTree extends StreamModel {
    /**
     * Hoeffding Tree or VFDT.
     *
     * @param {integer} max_byte_size           Maximum memory consumed by the tree.
     * @param {integer} memory_estimate_period  Number of instances between memory consumption checks.
     * @param {integer} grace_period            Number of instances a leaf should observe between split attempts.
     * @param {string} split_criterion          Split criterion to use (possible strings 'gini' - Gini Index, 'info_gain' - information gain).
     * @param {float} split_confidence          Allowed error in split decision, a value closer to 0 takes longer to decide.
     * @param {float} tie_threshold             Threshold below which a split will be forced to break ties.
     * @param {boolean} binary_split            If true, only allow binary splits.
     * @param {boolean} stop_mem_management     If true, stop growing as soon as memory limit is hit.
     * @param {boolean} remove_poor_atts        If true, disable poor attributes.
     * @param {boolean} no_preprune             If true, disable pre-pruning.
     * @param {string} leaf_prediction          Prediction mechanism used at leafs ('mc' - majority class, 'nb' - Naive Bayes, 'nba' - Naive Bayer Adaptive).
     * @param {integer} nb_threshold            Number of instances a leaf should observe before allowing Naive Bayes.
     * @param {array} nominal_attributes        List of Nominal attributes. If emtpy, then assume that all attributes are numerical.
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