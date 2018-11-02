let assert = require('assert');
let QStream = require('../index.js');

describe('tree', function() {
    describe('Hoeffding tree', function() {
        it('instantiating Hoeffding tree returns object of type HoeffdingTree', function() {
            let ht = new QStream.Tree.HoeffdingTree();
            assert.equal(typeof(ht), 'object');
            assert.equal(ht.constructor.name, 'HoeffdingTree');
        });
    })
})