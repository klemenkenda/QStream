let assert = require('assert');
let QStream = require('../index.js');

describe('tree', function() {
    describe('Hoeffding tree', function() {
        it('instantiating stream model throws error', function() {
            let ht = new QStream.Tree.HoeffdingTree(1,2);
        });
    })
})