function sum(array) {
    sum = 0;
    for(let i = 0; i < array.length() ; i++) {
        sum += array[i];
    }
    return sum;
}

function unique_labels(classes) {
    let mySet = new Set(classes);
    classes = Array.from(mySet).sort(function(a, b){return a - b});
    return classes;
}

function _check_partial_fit_first_call(clf, classes = null){
    if((clf.classes_ === undefined || clf.classes_ == null) && classes == null ){
        throw new Error("Classes must be passed on the first call to partial_fit.");
    }
    else if(classes != null) {
        classes = unique_labels(classes)

        if(clf.classes_ != undefined && clf.classes_ != null){
            if(JSON.stringify(clf.classes_) != JSON.stringify(classes)) {
                throw new Error('classes is not the same as on last call')
            }
        }
        else {
            clf.classes_ = classes;
            return true;
        }
    }
    return false;
}

function label_binarize(y, classes) {
    let Y = [];
    for(let i = 0; i < y.length; i++) {
        let bin = [];
        for(let j = 0; j < classes.length; j++) {
            if(y[i] == classes[j]){
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


module.exports.sum = sum;
module.exports.unique_labels = unique_labels;
module.exports._check_partial_fit_first_call = _check_partial_fit_first_call;
module.exports.label_binarize = label_binarize;

//console.log(_check_partial_fit_first_call({classes_: [2,3,4,22]}, [2,3,22,2,3,4]))
//console.log(_check_partial_fit_first_call({classes_: undefined}, [2,3,22,2,3,4]))

console.log(label_binarize([1,2,2,3,1,1,2,3], [2,1,3,4]))