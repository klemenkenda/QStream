/** sum
 * 
 * sum the values in array
 * 
 * @param {array} array arry
 * @return {number} returns sum
 */
function sum(array) {
    let sum = 0;
    for (let i = 0; i < array.length ; i++) {
        sum += array[i];
    };
    return sum;
};

/** unique
 * 
 * Take each element in array of classes only once and sort it.
 * 
 * @param {array} classes array of classes
 * @returns {array} returns unique classes
 */
function unique(classes) {
    let mySet = new Set(classes);
    classes = Array.from(mySet).sort(function(a, b) {return a - b});
    return classes;
};

/** _check_partial_fit_first_call
 * 
 * Ichecks if this is the first call to partisal fit.
 * If it is not, it checks if classes are the same as the last time. 
 * If it is the first call it sets classes.
 * 
 * @param {class - object} clf 
 * @param {array} classes 
 * @return {bool} true if it is first call to partial fit.
 */
function _check_partial_fit_first_call(clf, classes = null) {
    if ((clf.classes_ === undefined || clf.classes_ == null) && classes == null ) {
        throw new Error("Classes must be passed on the first call to partial_fit.");
    } else if (classes != null) {
        classes = unique(classes)
        if (clf.classes_ != undefined && clf.classes_ != null) {
            if (JSON.stringify(clf.classes_) != JSON.stringify(classes)) {
                throw new Error('classes is not the same as on last call')
            };
        } else {
            clf.classes_ = classes;
            return (true);
        };
    };
    return (false);
};

/** label_binarize
 * 
 * Binarize labels in a one-vs-all fashion.
 * 
 * @param {array} y Sequence labels or multilabel data to encode.
 * @param {array} classes Uniquely holds the label for each class.
 * @return {array} array with binarized arrays.
 */
function label_binarize(y, classes) {
    let Y = [];
    for (let i = 0; i < y.length; i++) {
        let bin = [];
        for (let j = 0; j < classes.length; j++) {
            if (y[i] == classes[j]) {
                bin.push(1);
            } else{
                bin.push(0);
            };
        };
        Y.push(bin);
    };
    return Y;
};

/** dot
 * 
 * Matrix multyplication.
 * 
 * @param {array} x 
 * @param {array} y 
 * @return {array} product
 */
function dot(x, y) {
    let multy = [];
    let dimensions = [x.length, y[0].length];
    for (let i = 0; i < dimensions[0]; i++) {
        multy.push(new Array(dimensions[1]).fill(0));
    };

    for (let j = 0; j < y[0].length; j++) {
        for (let k = 0; k < x.length; k++) {
            for (let i = 0; i < y.length; i++) {
                multy[k][j] = multy[k][j] + x[k][i] * y[i][j];
            };
        };
    };
    return multy;
};

/** Transpose
 * 
 * Transpose matrix.
 * 
 * @param {array} x 
 * @return {array} transposed
 */
function transpose(x) {
    let y = [];
    let dimensions = [x[0].length, x.length];
    for (let i = 0; i < dimensions[0]; i++) {
        y.push(new Array(dimensions[1]).fill(0));
    };
    for (let i = 0; i < dimensions[0]; ++i) {
        for (let j = 0; j < dimensions[1]; j++) {
            y[i][j] = x[j][i];
        };
    };
    return (y);
};

/** logsumexp
 * 
 * Compute the log of the sum of exponentials of input elements.
 * 
 * @param {array} arr 
 * @return {number}
 */
function logsumexp(arr) {

    let arr2 = [];
    let max = Math.max(...arr);
    for (let i = 0; i < arr.length; i++){
        arr2.push(arr[i] - max);
    };
    let exp = arr2.map(function(val) {
        return Math.exp(val) 
    })
    let sum = exp.reduce((a,b) => a + b);
    let log = Math.log(sum);

    return (log + max);
};

function mean(arr) {
    let sum_ = sum(arr);
    return (sum_ / arr.length);
};

function variance(arr) {
    let mean_ = mean(arr);
    let mean_minus = arr.map(function(num) {
        return (Math.pow(num - mean_, 2));
    });
    let sum_ = sum(mean_minus);
    return (sum_ / arr.length);
};

module.exports.sum = sum;
module.exports.unique = unique;
module.exports._check_partial_fit_first_call = _check_partial_fit_first_call;
module.exports.label_binarize = label_binarize;
module.exports.transpose = transpose;
module.exports.dot = dot;
module.exports.logsumexp = logsumexp;
module.exports.mean = mean;
module.exports.variance = variance;