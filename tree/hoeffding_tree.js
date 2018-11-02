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

class FoundNode {
    /**
     * Base class for tree nodes.
     *
     * @param {Node} node               The node object (split or learning node).
     * @param {SplitNode} parent        The node's parent (SplitNode or null).
     * @param {integer} parent_branch   The parent node's branch.
     */
    constructor(node = null, parent = null, parent_branch = null) {
        this.node = node;
        this.parent = parent;
        this.parent_branch = parent_branch;
    }
}

class Node {
    /**
     * Base class for nodes in a Hoeffding Tree.
     *
     * @param {dict} class_observations     Class observations (dict (class_value, weight) or null).
     */
    constructor(class_observations) {
        if (class_observations == null) {
            class_observations = {};
        }
        this._observed_class_distribution = class_observations;
    }

    /**
     * Determine if the node is a leaf.
     *
     * Returns true if leaf, false otherwise.
     */
    is_leaf() {
        return true;
    }

    /**
     * Traverse down the tree to locate the corresponding leaf for an instance.
     *
     * @param {instance} X          Data instances - array of shape (n_samples, n_features). TODO: is this true?
     * @param {*} parent            Parent node.
     * @param {*} parent_branch     Parent branch index.
     *
     * Returns The corresponding leaf (FoundNode).
     */
    filter_instance_to_leaf(X, parent, parent_branch) {
        // TODO: ?
        return null;
    }

    /**
     * Get the current observed class distribution at the node.
     *
     * Returns class distribution at the node (dict(class_value, weight)).
     */
    get_observed_class_distribution() {
        return this._observed_class_distribution;
    }

    /**
     * Get the votes per class for a given instance.
     *
     * @param {array} X     Array of length equal to the number of features.
     * @param {*} ht        The Hoeffding tree.
     *
     * Returns class votes for the given instance (dict(class_value, weight)).
     */
    get_class_votes(X, ht) {
        // TODO: not really implemented here
        return null;
    }

    /**
     * Check if observed class distribution is pure, i.e. if all samples belong to the same class.
     *
     * Returns true if observed number of classes is less than 2, false otherwise.
     */
    observed_class_distribution_is_pure() {
        let count = 0;
        for (i in this._observed_class_distribution) {
            if (i.weight != 0) {
                count++;
                if (count == 2) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Calculate the depth of the subtree from this node.
     *
     * Returns subtree depth, 0 if the node is a leaf.
     */
    subtree_depth() {
        return 0;
    }

    // TODO
    describe_subtree(ht, buffer, indent = 0) {
        return null;
    }
}

class SplitNode extends Node {

}

class LearningNode extends Node {

}



module.exports = HoeffdingTree;