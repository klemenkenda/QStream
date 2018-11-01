let assert = require('assert');
let QStream = require('../index.js');

describe('core', function() {
    describe('stream model - abstract class', function() {
        it('instantiating stream model throws error', function() {
            assert.throws(function() { new QStream.Core.StreamModel() }, Error, "Error thrown.");
        });
    })
})