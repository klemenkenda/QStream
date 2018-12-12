let core = require('./core/index.js');
let tree = require('./tree/index.js');
let drift_detection = require('./drift_detection/index.js');
let data = require('./data/index.js');
let bayes = require('./bayes/index.js')

module.exports = {
    Core: core,
    Tree: tree,
    DriftDetection: drift_detection,
    Data: data,
    NaiveBaes: bayes
}