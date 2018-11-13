let Stream = require('./base_stream.js')
//let Utils = require('./utils.js')

class RandomTreeGenerator extends Stream {
    /* RandomTreeGenerator
     *    
     * This generator is built based on its description in Domingo and Hulten's 
     * 'Knowledge Discovery and Data Mining'. The generator is based on a random 
     * tree that splits features at random and sets labels to its leafs.
     * 
     * The tree structure is composed on Node objects, which can be either inner 
     * nodes or leaf nodes. The choice comes as a function fo the parameters 
     * passed to its initializer.
     * 
     * Since the concepts are generated and classified according to a tree 
     * structure, in theory, it should favour decision tree learners.
     * 
     * Parameters
     * ----------
     * tree_random_state: int (Default: null)
     *      Seed for random generation of tree.
     * 
     * sample_random_state: int (Default: null)
     *      Seed for random generation of instances.
     * 
     * n_classes: int (Default: 2)
     *      The number of classes to generate.
     * 
     * n_cat_features: int (Default: 5)
     *      The number of categorical features to generate. Categorical features are binary encoded, the actual number of
     *      categorical features is `n_cat_features`x`n_categories_per_cat_feature`
     * 
     * n_num_features: int (Default: 5)
     *      The number of numerical features to generate.
     * 
     * n_categories_per_cat_feature: int (Default: 5)
     *      The number of values to generate per categorical feature.
     * 
     * max_tree_depth: int (Default: 5)
     *      The maximum depth of the tree concept.
     * 
     * min_leaf_depth: int (Default: 3)
     *      The first level of the tree above MaxTreeDepth that can have leaves.
     * 
     * fraction_leaves_per_level: float (Default: 0.15)
     *      The fraction of leaves per level from min_leaf_depth onwards. 
     */

    constructor(tree_random_state = null, sample_random_state = null, n_classes = 2, n_cat_features = 5,
                n_num_features = 5, n_categories_per_cat_feature = 5, max_tree_depth = 5, min_leaf_depth = 3,
                fraction_leaves_per_level = 0.15) {
        super()
        this._original_tree_random_state = tree_random_state;
        this._original_sample_random_state = sample_random_state;
        this.n_classes = n_classes;
        this.n_targets = 1;
        this.n_num_features = n_num_features;
        this.n_cat_features = n_cat_features;
        this.n_categories_per_cat_feature = n_categories_per_cat_feature;
        this.n_features = this.n_num_features + this.n_cat_features * this.n_categories_per_cat_feature;
        this.max_tree_depth = max_tree_depth;
        this.min_leaf_depth = min_leaf_depth;
        this.fraction_of_leaves_per_level = fraction_leaves_per_level;
        this.tree_root = null;
        this.sample_random_state = null;
        this.name = "Random Tree Generator";
        this.configure();
    }

    configure(){
        this.target_names = ['class'];
        this.feature_names =[];
        for (let i = 0; i < this.n_num_features; i++) {
            this.feature_names.push('att_num_' + i);
        }

        for (let i =0; i < this.n_cat_features; i++) {
            for (let j = 0; j < this.n_categories_per_cat_feature; j++) {
                this.feature_names.push('att_nom' + i + '_val' + j);
            }
        }
        this.target_values = []
        for (let i = 0; i<this.n_classes; i++) {
            this.target_values.push(i);
        }
    }

    prepare_for_use(){
        this.sample_idx = 0;
        this.generate_random_tree();
    }

    generate_random_tree(){
        /* generate_random_tree
         *
         * Generates the random tree, starting from the root node and following 
         * the constraints passed as parameters to the initializer. 
         *
         * The tree is recursively generated, node by node, until it reaches the
         * maximum tree depth.
         * 
         */

        let nominal_att_candidates = [];
        let min_numeric_value = [];
        let max_numeric_value = [];

        for (let i = 0; i < this.n_num_features; i++){
            min_numeric_value.push(0.0);
            max_numeric_value.push(1.0);
        }

        for (let i = 0; i< this.n_num_features+this.n_cat_features; i++) {
            nominal_att_candidates.push(i);
        }
        this.tree_root = this.generate_random_tree_node(0, nominal_att_candidates, min_numeric_value, max_numeric_value);
    }

    generate_random_tree_node(current_depth, nominal_att_candidates, min_numeric_value, max_numeric_value, random_state) {
        /* generate_random_tree_node
         *
         * Creates a node, choosing at random the splitting feature and the
         * split value. Fill the features with random feature values, and then 
         * recursively generates its children. If the split feature is a
         * numerical feature there are going to be two children nodes, one
         * for samples where the value for the split feature is smaller than
         * the split value, and one for the other case.
         * 
         * Once the recursion passes the leaf minimum depth, it probabilistic 
         * chooses if the node is a leaf or not. If not, the recursion follow 
         * the same way as before. If it decides the node is a leaf, a class 
         * label is chosen for the leaf at random.
         * 
         * Furthermore, if the current_depth is equal or higher than the tree 
         * maximum depth, a leaf node is immediately returned.
         * 
         * Parameters
         * ----------
         * current_depth: int
         *     The current tree depth.
         * 
         * nominal_att_candidates: array
         *     A list containing all the, still not chosen for the split, 
         *     nominal attributes.
         * 
         * min_numeric_value: array
         *     The minimum value reachable, at this branch of the 
         *     tree, for all numeric attributes.
         * 
         * max_numeric_value: array
         *     The minimum value reachable, at this branch of the 
         *     tree, for all numeric attributes.
         *     
         * random_state: numpy.random
         *     A numpy random generator instance.
         * 
         * Returns
         * -------
         * random_tree_generator.Node
         *     Returns the node, either a inner node or a leaf node.
         * 
         * Notes
         * -----
         * If the splitting attribute of a node happens to be a nominal attribute 
         * we guarantee that none of its children will split on the same attribute, 
         * as it would have no use for that split. 
         */

        if (true) {
            let leaf = new Node();
            leaf.class_label = Math.floor(Math.random() * this.n_classes);
            console.log(leaf)
            return leaf;
        }
        


        // ni še končano
    }
}

class Node{
    /* 
     * Node
     * 
     * Class that stores the attributes of a node. No further methods.
     * 
     * Parameters
     * ----------
     * class_label: int, optional
     *     If given it means the node is a leaf and the class label associated 
     *     with it is class_label.
     *     
     * split_att_index: int, optional
     *     If given it means the node is an inner node and the split attribute 
     *     is split_att_index.
     *     
     * split_att_value: int, optional
     *     If given it means the node is an inner node and the split value is 
     *     split_att_value.
     */
    constructor(){
        this.class_label = null
        this.split_att_index = null
        this.split_att_value = null
        this.children = []
    }
}


let tree = new RandomTreeGenerator()
console.log(tree.target_values)
tree.generate_random_tree()