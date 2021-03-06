let core = require('../core/index.js');
let StreamModel = core.StreamModel;
let NominalAttributeClassObserver = require('./nominal_attribute_class_observer.js');
let NumericAttributeClassObserverGaussian = require('./numeric_attribute_class_observer_gaussian.js');
let AttributeClassObseverNull = require('./attribute_class_observer_null.js');
let do_naive_bayes_prediction = require('./utils.js');

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

        this._tree_root = null;
        this._decision_node_cnt = 0;
        this._active_leaf_node_cnt = 0;
        this._inactive_leaf_node_cnt = 0;
        this._inactive_leaf_byte_size_estimate = 0.0;
        this._active_leaf_byte_size_estimate = 0.0;
        this._byte_size_estimate_overhead_fraction = 1.0;
        this._growth_allowed = true;
        this._train_weight_seen_by_model = 0.0;
        this._classes = null;
    }

    // leaving simple property setters and getters out as the
    // properties of the object are accessible/public

    // TODO: split criterion setter has some additional internal logic
    // to check whether the existing criterion has been used

    // TODO: leaf prediction setter has the same logic as criterion setter

    /**
     * Setting nominal attributes.
     *
     * @param {array} nominal_attributes Array of keys of nominal attributes.
     */
    nominal_attributes(nominal_attributes) {
        if (nominal_attributes == null) {
            nominal_attributes = [];
        }
        this._nominal_attributes = nominal_attributes;
    }

    /**
     * Calculate the size of the tree.
     *
     * Returns size of the tree in bytes (int).
     */
    measure_byte_size() {
        return calculate_object_size(this);
    }

    /**
     * Reset the Hoeffding Tree to default values.
     */
    reset() {
        this._tree_root = null;
        this._decision_node_cnt = 0;
        this._active_leaf_node_cnt = 0;
        this._inactive_leaf_node_cnt = 0;
        this._inactive_leaf_byte_size_estimate = 0.0;
        this._active_leaf_byte_size_estimate = 0.0;
        this._byte_size_estimate_overhead_fraction = 1.0;
        this._growth_allowed = true;
        if (this._leaf_prediction != MAJORITY_CLASS) {
            this._remove_poor_atts = null;
        }
        this._train_weight_seen_by_model = 0.0;
    }

    /**
     * Fit method is not implemented.
     */
    fit(X, y, clases = null, weight = null) {
        throw new TypeError("fit not implemented for Hoeffding tree");
    }

    /**
     * Incrementally trains the model. Train samples (instances) are composed of X attributes and their
     * corresponding targets y.
     *
     * Tasks performed before training:
     * - If more than one instance is passed, loop through X and pass instances one at a time.
     * - Update weight seen by model.
     *
     * Training tasks:
     * - If the tree is empty, create a leaf node as the root.
     * - If the tree is already initialized, find the corresponding leaf for the instance and update the leaf node statistics.
     * - If growth is allowed and the number of instances that the leaf has observed between split attempts exceed the grace period then attempt to split.
     *
     * @param {array} X         Instance attributes of size (n_samples, n_features).
     * @param {array} y         Classes (targets) for all samples in X.
     * @param {array} classes   Contains the class values in the stream. If defined, will be used to define the length of the arrays returned by `predict_proba`.
     * @param {array} weight    Instance weight. If not provided, uniform weights are assumed.
     */
    partial_fit(X, y, classes = null, weight = null) {
        if ((this._classes == null) && (classes!= null)) {
            this._classes = classes;
        }

        if (y != null) {
            // check dimensions of X
            if (X[0].constructor !== Array) {
                // we are dealing with a single sample, we convert it to 2d array
                X = [X];
            }
            let row_cnt = X.length;

            // if weight is null, assume uniform weights
            if (weight == null) {
                weight = new Array(row_cnt).fill(1.0);
            }

            // check y, weight and X dimensions
            if (row_cnt != weight.length) {
                throw new RangeError("Hoeffding tree X and weight length mismatch!");
            }

            if (row_cnt != y.length) {
                throw new RangeError("Hoeffding tree X and y length mismatch!");
            }

            for (let i = 0; i < row_cnt; i++) {
                if (weight[i] != 0) {
                    this._train_weight_seen_by_model += weight[i];
                    this._partial_fit(X[i], y[i], weight[i]);
                }
            }
        }
    }

    /**
     * Trains the model on sample X and target y (single example).
     * This is private function, where acctual training is done.
     *
     * @param {Instance} X      Single instance.
     * @param {int} y           Single target for instance.
     * @param {float} weight    Single weight.
     */
    _partial_fit(X, y, weight) {
        // create root node if there is none
        if (this._tree_root == null) {
            this._tree_root = this._new_learning_node();
            this._active_leaf_node_cnt = 1;
        }

        // transverse the instance to the leaf
        let found_node = this._tree_root.filter_instance_to_leaf(X, null, -1);
        let leaf_node = found_node.node;

        // if leaf is empty, then create new learning node there
        if (leaf_node == null) {
            leaf_node = this._new_learning_node();
            found_node.parent.set_child(found_node.parent_branch, leaf_node);
            this._active_leaf_node_cnt++;
        }

        // is leaf node instance of learning node
        if (leaf_node instanceof LearningNode) {
            let learning_node = leaf_node;
            learning_node.learn_from_instance(X, y, weight, this);
            // TODO: undestand this!!!
            if ((this._growth_allowed) && (learning_node instanceof ActiveLearningNode)) {
                let active_learning_node = learning_node;
                let weight_seen = active_learning_node.get_weight_seen();
                let weight_diff = weight_seen - active_learning_node.get_weight_seen_at_last_split_evaluation();
                if (weight_diff >= this.grace_period) {
                    this._attempt_to_split(active_learning_node, found_node.parent, found_node.parent_branch);
                    active_learning_node.set_weight_seen_at_last_split_evaluation(weight_seen);
                }
            }
        }

        if (this._train_weight_seen_by_model % this.memory_estimate_period == 0) {
            this.estimate_model_byte_size();
        }
    }

    /**
     * Get class votes for a single instance.
     *
     * @param {Instance} X      Instance attributes.
     *
     * Returns dictionary (class_value, weight).
     */
    get_votes_for_instance(X) {
        if (this._tree_root == null) {
            let found_node = this._tree_root.filter_instance_to_leaf(X, null, -1);
            let leaf_node = found_node.node;

            if (leaf_node == null) {
                leaf_node = found_node.parent;
            }

            return leaf_node.get_class_votes(X);
        } else {
            return {};
        }
    }

    /**
     * Predicts the label of the X instance(s).
     *
     * @param {array} X     An array of instances.
     *
     * Returns predicted labels for all instances in X.
     */
    predict(X) {
        // TODO: do we check input - so that it is array of instances?
        let predictions = [];
        let y_proba = this.predict_proba(X);
        for (let j = 0; j < X.length; j++) {
            // argmax(y_proba[j])
            let index = y_proba[j].map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
            predictions.push(index);
        }
        return(predictions);
    }

    /**
     * Predicts probabilities of all label of the X instance(s).
     *
     * @param {array} X     An array of instances.
     *
     * Returns predicted probabilities for all labels for all instances in X.
     */
    predict_proba(X) {
        let predictions = [];

        for (let i = 0; i < X.length; i++) {
            let votes = this.get_votes_for_instance(X[i]);
            if (votes == {}) {
                // if tree is empty, all classes equal, default to zero
                predictions.push([0]);
            } else {
                let dict_values = Object.keys(votes).map(key => votes[key]);
                let sum = dict_values.reduce((a, b) => a + b, 0);
                if (sum != 0) {
                    normalize_values_in_dict(votes);
                }
                let y_proba;
                if (this._classes != null) {
                    y_proba = new Array(Math.max(...this._classes) + 1).fill(0);
                } else {
                    y_proba = new Array(Math.max(votes.keys()) + 1);
                }
                for (let key in votes) {
                    let value = votes[key];
                    y_proba[int(key)] = value;
                }
                predictions.push(y_proba);
            }
        }

        return(predictions);
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
        // map/reduce makes the code pretty unreadable :(
        let dict_values = Object.keys(this._observed_class_distribution).map(key => this._observed_class_distribution[key]);
        let count = dict_values.reduce((a, b) => {
            if (b != 0) return a + 1;
            else return a;
        }, 0);

        if (count >= 2) return false;
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

    /**
     * Calculate node's promise.
     *
     * Returns an integer. A small value indicates that the node has seen more samples of a given class than the other classes.
     */
    calculate_promise() {
        let dict_values = Object.keys(this._observed_class_distribution).map(key => this._observed_class_distribution[key]);
        let total_seen = dict_values.reduce((a, b) => a + b, 0);

        if (total_seen > 0) {
            return total_seen - Math.max(...dict_values);
        } else {
            return 0;
        }
    }

    // TODO
    describe_subtree(ht, buffer, indent = 0) {
        return null;
    }
}

class SplitNode extends Node {
    /**
     * Node that splits the data in a Hoeffding Tree.
     *
     * @param {string} split_test           Split test. TODO: check???
     * @param {dict} class_observations     Class observations represented in dict (class_value, weight) or null.
     */
    constructor(split_test, class_observations) {
        super();
        this._split_test = split_test;
        this.children = {}; // TODO: check why list, not array
    }

    /**
     * Count the number of children for a node.
     */
    num_children() {
        return this._children.length
    }

    /**
     * Set node as a child.
     *
     * @param {int} index   Branch index where the node will be inserted.
     * @param {Node} node   The node to insert.
     */
    set_child(index, node) {
        if ((this._split_test.max_branches() >= 0) && (index >= this._split_test.max_branches())) {
            throw new RangeError("set_child index mismatch");
        }
        // TODO: check size; should we use push?
        this._children[index] = node;
    }

    /**
     * Retrieve a node's child given its branch index.
     *
     * @param {int} index   Branch index of the child.
     *
     * Returns child node of type HoeffdingTree.Node or null.
     */
    get_child(index) {
        if ((index > 0) && (index < this._children.length)) {
            this._children[index];
        } else {
            return null;
        }
    }

    /**
     * Get the branch index for a given instance at the current node.
     *
     * @param {instance} X     Instance to find the child.
     */
    instance_child_index(X) {
        return this._split_test.branch_for_instance(X);
    }

    /**
     * This is a split node, not a leaf.
     */
    is_leaf() {
        return false;
    }

    /**
     * Traverse down the tree to locate the corresponding leaf for an instance.
     *
     * @param {instance} X          Data instance, array (n_features). TODO: recheck!
     * @param {Node} parent         Parent node of type HoeffdingTree.Node.
     * @param {int} parent_branch   Parent branch index.
     *
     * Returns lef node for the instance (of type FoundNode).
     */
    filter_instance_to_leaf(X, parent, parent_branch) {
        let child_index = this.instance_child_index(X);
        if (child_index >= 0) {
            child = this.get_child(child_index);
            if (child != null) {
                return child_index.filter_instance_to_leaf(X, this, child_index);
            } else {
                return new FoundNode(this, child_index);
            }
        } else {
            return new FoundNode(parent, parent_branch);
        }
    }

    /**
     * Calculate the depth of the subtree from this node.
     *
     * Returns subtree depth (integer). Value is 0 if it is a leaf.
     */
    subtree_depth() {
        // initial depth
        let max_child_depth = 0;

        // transverse children and find the one with the deepest subtree
        for (let i in this._children) {
            let child = this._children[i];
            if (child != null) {
                let depth = child.subtree_depth();
                if (depth > max_child_depth) {
                    max_child_depth = depth;
                }
            }
        }

        return max_child_depth + 1;
    }

    /**
     * Walk the tree and write its structure to a buffer string.
     *
     * @param {HoeffdingTree} ht    The tree to describe.
     * @param {string} buffer       The buffer where the tree's structure will be stored.
     * @param {int} indent          Indentation level (number of white spaces for current node).
     */

    // TODO: ht and buffer are not needed?
    describe_subtree(ht, buffer, indent = 0) {
        // TODO: no implementation yet.
    }
}

class LearningNode extends Node {

    /**
     * Base class for Learning Nodes in a Hoeffding Tree.
     *
     * @param {array} initial_class_observations    Initial class observations dict (class_value, weight) or null.
     */
    constructor(initial_class_observations = null) {
        super(initial_class_observations);
    }

    /**
     * Update the node with the provided instance.
     *
     * @param {instance} X                  Instance attributes for updating the node (array of length equal to number of features).
     * @param {int} y                       Instance class.
     * @param {float} weight                Instance weight.
     * @param {HoeffdingTree} htinstance    Hoeffding tree to update.
     */
    learn_from_instance(X, y, weight, ht) {
        return;
    }
}

class InactiveLearningNode extends LearningNode {
    /**
     * Inactive learning node is th enode that does not grow.
     *
     * @param {array} initial_class_observations    Initial class observations (dictionary (class_value, weight) or null).
     */
    constructor(initial_class_observations = null) {
        super(initial_class_observations);
    }

    /**
     * Update the node with the provided instance.
     *
     * @param {instance} X                  Instance attributes for updating the node (array of length equal to number of features).
     * @param {int} y                       Instance class.
     * @param {float} weight                Instance weight.
     * @param {HoeffdingTree} htinstance    Hoeffding tree to update.
     */
    learn_from_instance(X, y, weight, ht) {
        try {
            this._observed_class_distribution[y] += weight;
        } catch(e) {
            // TODO: will this work?
            this._observed_class_distribution[y] = weight;
        }

    }
}

class ActiveLearningNode extends LearningNode {
    /**
     * Learning node that supports growth.
     *
     * @param {array} initial_class_observations    Initial class observations (dictionary (class_value, weight) or null).
     */
    constructor(initial_class_observations) {
        super(initial_class_observations);
        this._weight_seen_at_last_split_evaluation = self.get_weight_seen();
        this._attribute_observers = {};
    }

    /**
     * Update the node with the provided instance.
     *
     * @param {instance} X                  Instance attributes for updating the node (array of length equal to number of features).
     * @param {int} y                       Instance class.
     * @param {float} weight                Instance weight.
     * @param {HoeffdingTree} htinstance    Hoeffding tree to update.
     */
    learn_from_instance(X, y, weight, ht) {
        try {
            this._observed_class_distribution[y] += weight;
        } catch(e) {
            // TODO: will this work?
            this._observed_class_distribution[y] = weight;
        }

        let obs;

        for (let i = 0; i < X.length; i++) {
            try {
                obs = this._attribute_observers[i];
            } catch(e) {
                if (ht.nominal_attributes.indexOf(i) >= 0) {
                    obs = NominalAttributeClassObserver();
                } else {
                    obs = NumericAttributeClassObserverGaussian();
                }
                this._attribute_observers[i] = obs;
            }
            obs.observe_attribute_class(X[i], y, weight);
        }
    }

    /**
     * Calculate the total weight seen by the node.
     *
     * Returns total weight seen (float).
     */
    get_weight_seen() {
        let dict_values = Object.keys(this._observed_class_distribution).map(key => this._observed_class_distribution[key]);
        let total_seen = dict_values.reduce((a, b) => a + b, 0);
        return total_seen;
    }

    /**
     * Retrieve the weight seen at last split evaluation.
     *
     * Returns weight seen at last split evaluation (float).
     */
    get_weight_seen_at_last_split_evaluation() {
        return this._weight_seen_at_last_split_evaluation;
    }

    /**
     * Retrieve the weight seen at last split evaluation.
     *
     * @param {float} weight     Weight seen at last split evaluation.
     */
    set_weight_seen_at_last_split_evaluation(weight) {
        this._weight_seen_at_last_split_evaluation = weight;
    }

    /**
     * Find possible split candidates.
     *
     * @param {SplitCriterion} criterion    The splitting criterion to be used.
     * @param {HoeffdingTree} ht            Hoeffding tree.
     *
     * Returns list of split candidates.
     */
    get_best_split_suggestions(criterion, ht) {
        let best_suggestions = [];
        let pre_split_dist = this._observed_class_distribution;

        if (!ht.no_preprune) {
            let null_split = AttributeSplitSuggestion(null, [{}], criterion.get_merit_of_split(pre_split_dist, [pre_split_dist]));
            best_suggestions.append(null_split);
        };

        for (let i in this._attribute_observers) {
            obs = this._attribute_observers[i];
            best_suggestion = obs.get_best_evaluated_split_suggestion(criterion, pre_split_dist, i, ht.binary_split);

            if (best_sugestion != null) {
                best_suggestions.append(best_suggestion);
            }
        }
        return best_suggestions;
    }

    /**
     * Disable attribute observer.
     *
     * @param {int} att_idx     Attribute index.
     */
    disable_attribute(att_idx) {
        if (this._attribute_observers.indexOf(att_idx) >= 0) {
            this._attribute_observers[att_idx] = AttributeClassObserverNull();
        }
    }

}

class LearningNodeNB extends LearningNode {
    /**
     * Learning node that uses Naive Bayes models.
     *
     * @param {array} initial_class_observations    Initial class observations (dictionary (class_value, weight) or null).
     */
    constructor(initial_class_observations) {
        super(initial_class_observations);
    }

    /**
     * Get the votes per class for a given instance.
     *
     * @param {instance} X          Instance attributes.
     * @param {HoeffdingTree} ht    Hoeffding tree.
     *
     * Returns class votes for the given instance in the form of dictionary (class_value, weight).
     */
    get_class_votes(X, ht) {
        if (this.get_weight_seen() >= ht.nb_threshold) {
            return do_naive_bayes_prediction(X, this._observed_class_distribution, this._attribute_observers);
        } else {
            super.get_class_votes(X, ht);
        }
    }

    /**
     * Disable attribute observer.
     * Disabled in Nodes using Naive Bayes, since poor attributes are used in Naive Bayes calculation.
     *
     * @param {int} att_idx     Attribute index.
     */
    disable_attribute(att_idx) {
        return;
    }
}

class LearningNodeNBAdaptive extends LearningNodeNB {
    /**
     * Learning node that uses Adaptive Naive Bayes models.
     *
     * @param {array} initial_class_observations    Initial class observations (dictionary (class_value, weight) or null).
     */
    constructor(initial_class_observations) {
        super(initial_class_observations);
        this._mc_correct_weight = 0.0;
        this._nb_correct_weight = 0.0;
    }

    /**
     * Update the node with the provided instance.
     *
     * @param {instance} X                  Instance attributes for updating the node (array of length equal to number of features).
     * @param {int} y                       Instance class.
     * @param {float} weight                Instance weight.
     * @param {HoeffdingTree} htinstance    Hoeffding tree to update.
     */
    learn_from_instance(X, y, weight, ht) {
        if (this._observed_class_distribution == {}) {
            // all classes equal, default to class 0
            if (y == 0) {
                this._mc_correct_weight += weight;
            }
        } else if (Math.max(...Object.keys(this._observed_class_distribution).map(key => this._observed_class_distribution[key])) == y) {
            this._mc_correct_weight += weight;
        }

        let nb_prediction = do_naive_bayes_prediction(X, this._observed_class_distribution, this._attribute_observers);

        Math.max(...Object.keys(a).map(key => a[key]))

        if (Math.max(...Object.keys(nb_prediction).map(key => nb_prediction[key])) == y) {
            this._nb_correct_weight += weight;
        }

        super.learn_from_instance(X, y, weight, ht);
    }

    /**
     * Get the votes per class for a given instance.
     *
     * @param {instance} X          Instance attributes.
     * @param {HoeffdingTree} ht    Hoeffding tree.
     *
     * Returns class votes for the given instance in the form of dictionary (class_value, weight).
     */
    get_class_votes(X, ht) {
        // returns either majority class or naive bayes
        if (this._mc_correct_weight > this._nb_correct_weight) {
            return this._observed_class_distribution;
        } else {
            return do_naive_bayes_prediction(X, this._observed_class_distribution, this._attribute_observers);
        }
    }
}

module.exports = HoeffdingTree;