/**
 * Copyright (c) Jožef Stefan Institute & contributors to the QStream project, 2018.
 * All rights reserved.
 *
 * This source code is licensed under the FreeBSD license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Core - base stream model class.
 * Author: Klemen Kenda, klemen.kenda@ijs.si
 */

class StreamModel {
    /**
     * Interface (abstract class) for stream models. This class provides a template that
     * the stream models must follow in QStream (based on scikit-multiflow).
     *
     * The class should not be instantiated as it is an abstract class.
     */
    constructor() {
        // nothing really happens here
        if (new.target === StreamModel) {
            throw new TypeError("Cannot construct StreamModel instances directly");
        }
    }

    /**
     * Fit the model under the batch setting.
     *
     * @param {array}  X         The array of samples used to fit the model in format (n_samples, n_features).
     * @param {vector} y         An array-like with the labels of all samples in X.
     * @param {vector} classes   Contains all possible labels. Applicability varies depending on the algorithm.
     * @param {vector} weights   Instance weight. If not provided, uniform weights are assumed.
     *                           Applicability varies depending on the algorithm.
     */
    fit(X, y, classes = null, weights = null) {
        throw new TypeError("StreamModel - fit(X, y, classes, weights) not implemented.");
    }

    /**
     * Partial (incremental) fit the model under the stream learning setting.
     *
     * @param {array}  X         The array of samples used to fit the model in format (n_samples, n_features).
     * @param {vector} y         An array-like with the labels of all samples in X.
     * @param {vector} classes   Contains all possible labels. Applicability varies depending on the algorithm.
     * @param {vector} weights   Instance weight. If not provided, uniform weights are assumed.
     *                           Applicability varies depending on the algorithm.
     */
    partial_fit(X, y, classes = null, weights = null) {
        throw new TypeError("StreamModel - partial_fit(...) not implemented.");
    }

    /**
     * Predicts targets using the model.
     * Returns an array-like with all the predictions for the samples in X.
     * @param {array} X         The array of samples used to fit the model in format (n_samples, n_features).
     */
    predict(X) {
        throw new TypeError("StreamModel - predict(X) not implemented.");
    }

    /**
     * Predicts target probabilities in classifiers using the model.
     * Returns an array-like with the probabilities for each class in format (n_samples, n_labels).
     *
     * @param {array} X         The array of samples used to fit the model in format (n_samples, n_features).
     */
    predict_proba(X) {
        throw new TypeError("StreamModel - predict_proba(X) not implemented.");
    }

    /**
     * Calculates performance metrics on a particular model. This function is not
     * implemented an all models.
     *
     * @param {array}  X         The array of samples used to fit the model in format (n_samples, n_features).
     * @param {vector} y         An array-like with the labels of all samples in X.
     */
    score(X, y) {
        throw new TypeError("StreamModel - reset not implemented.");
    }

    /**
     * Resets the model to its initial state.
     */
    reset() {
        throw new TypeError("StreamModel - reset() not implemented.");
    }

    /**
     * Returns the class type.
     */
    get_class_type() {
        return 'estimator';
    }

    /**
     * Returns the info of the streaming model.
     */
    get_info() {
        throw new TypeError("StreamModel - get_info() not implemented.");
    }
}

module.exports = StreamModel;