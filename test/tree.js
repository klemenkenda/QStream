let assert = require('assert');
let QStream = require('../index.js');
let rewire = require('rewire');

let HoeffdingTreeInternal = rewire('../tree/hoeffding_tree.js');

describe('tree', function() {
    describe('Hoeffding tree internals', function() {
        describe('Node class', function() {
            let HTNode = HoeffdingTreeInternal.__get__('Node');

            it('instantiating Node with no observed_class_distribution', function() {
                let node = new HTNode(null);
                assert.deepEqual(node._observed_class_distribution, {});
            });

            let node = new HTNode({"x": 0.5, "y": 0, "z": 0.5});

            it('instantiating Node with initial observed_class_distribution', function() {
                assert.deepEqual(node._observed_class_distribution, {"x": 0.5, "y": 0, "z": 0.5});
            });

            it('node by default represents itself as a leaf', function() {
                assert.equal(node.is_leaf(), true);
            });

            it('filter_instance_to_leaf returns null', function() {
                assert.equal(node.filter_instance_to_leaf([1, 2, 3], -1, 0), null);
            });

            it('get_observed_class_distribution returns correct values', function() {
                assert.deepEqual(node.get_observed_class_distribution(), {"x": 0.5, "y": 0, "z": 0.5});
            });

            it('get_class_votes returns null', function() {
                assert.equal(node.get_class_votes(), null);
            });

            it('observed_class_distribution_is_pure is working fine', function() {
                let nodePure = new HTNode({"x": 1, "y": 0, "z": 0});
                assert.equal(nodePure.observed_class_distribution_is_pure(), true);
                assert.equal(node.observed_class_distribution_is_pure(), false);
            });

            it('subtree depth returns 0', function() {
                assert.equal(node.subtree_depth(), 0);
            });

            it('calculate promise test', function() {
                assert.equal(node.calculate_promise(), 0.5);
                let nodePure = new HTNode({"x": 1, "y": 0, "z": 0});
                assert.equal(nodePure.calculate_promise(), 0);
            });
        });
    });

    describe('Hoeffding tree', function() {
        it('instantiating Hoeffding tree returns object of type HoeffdingTree', function() {
            let ht = new QStream.Tree.HoeffdingTree();
            assert.equal(typeof(ht), 'object');
            assert.equal(ht.constructor.name, 'HoeffdingTree');
        });
    });


})