
//MOVE IN utils
function sum(array) {
    sum = 0;
    for(let i = 0; i < array.length ; i++) {
        sum += array[i];
    }
    return sum;
}

function unique_labels(classes) {
    let mySet = new Set(classes);
    classes = Array.from(mySet).sort(function(a, b) {return a - b});
    return classes;
}

function _check_partial_fit_first_call(clf, classes = null) {
    if((clf.classes_ === undefined || clf.classes_ == null) && classes == null ) {
        throw new Error("Classes must be passed on the first call to partial_fit.");
    }
    else if(classes != null) {
        classes = unique_labels(classes)

        if(clf.classes_ != undefined && clf.classes_ != null) {
            if(JSON.stringify(clf.classes_) != JSON.stringify(classes)) {
                throw new Error('classes is not the same as on last call')
            }
        }
        else {
            clf.classes_ = classes;
            return (true);
        }
    }
    return (false);
}

function label_binarize(y, classes) {
    let Y = [];
    for(let i = 0; i < y.length; i++) {
        let bin = [];
        for(let j = 0; j < classes.length; j++) {
            if(y[i] == classes[j]) {
                bin.push(1);
            }
            else{
                bin.push(0);
            }
        }
        Y.push(bin);
    }
    return Y;
}

function dot(x, y) {
    let multy = [];
    let dimensions = [x.length, y[0].length];
    for (let i = 0; i < dimensions[0]; i++) {
        multy.push(new Array(dimensions[1]).fill(0));
    }

    for(let j = 0; j < y[0].length; j++) {
        for(let k = 0; k < x.length; k++) {
            for(let i = 0; i < y.length; i++) {
                multy[k][j] = multy[k][j] + x[k][i] * y[i][j];
            }
        }
    }

/*     if(multy.length == 1) {
        multy = multy[0];
    } */
    return multy;
}

function transpose(x) {
    let y = [];
    let dimensions = [x[0].length, x.length];
    for (let i = 0; i < dimensions[0]; i++) {
        y.push(new Array(dimensions[1]).fill(0));
    }
    for (let i = 0; i < dimensions[0]; ++i) {
        for (let j = 0; j < dimensions[1]; j++) {
            y[i][j] = x[j][i];
        }
    }
    return (y);
}

function logsumexp(arr) {

    let arr2 = [];
    let max = Math.max(...arr);
    for(let i = 0; i < arr.length; i++){
        arr2.push(arr[i] - max);
    }
    let exp = arr2.map(function(val) {
        return Math.exp(val) 
    })
    let sum = exp.reduce((a,b) => a + b);
    let log = Math.log(sum);

    return (log + max);
}

module.exports.sum = sum;
module.exports.unique_labels = unique_labels;
module.exports._check_partial_fit_first_call = _check_partial_fit_first_call;
module.exports.label_binarize = label_binarize;
module.exports.transpose = transpose;
module.exports.dot = dot;
module.exports.logsumexp = logsumexp;

//console.log(_check_partial_fit_first_call({classes_: [2,3,4,22]}, [2,3,22,2,3,4]))
//console.log(_check_partial_fit_first_call({classes_: undefined}, [2,3,22,2,3,4]))

//console.log(label_binarize([1,2,2,3,1,1,2,3], [2,1,3,4]))
//console.log(multy_T_add([ [ 3, 4, 5, 6, 7 ], [ 1, 1, 1, 1, 1 ] ],[[1,0],[0,1],[1,0]],[[1,2,3,4,5],[1,1,1,1,1],[2,2,2,2,2]]))

//console.log(dot([[1,1,1],[0,1,2]],[[1,2,3,4,5],[1,1,1,1,1],[2,2,2,2,2]]))

//console.log(transpose([[1,1,1],[0,1,2]]) )

//console.log(logsumexp([-1000,-1000,-1003,-1004,-1005]))
