function do_naive_bayes_prediction(X, observed_class_distribution, attribute_observers) {
    if (observed_class_distribution == {}) {
        // No observed class distributions, all classes equal
        return {0: 0.0};
    }
    votes = {};

    let dict_values = Object.keys(observed_class_distribution).map(key => observed_class_distribution[key]);
    let observed_class_sum = dict_values.reduce((a, b) => a + b, 0);

    for (class_index in observed_class_distribution) {
        let observed_class_val = observed_class_distribution[class_index];
        votes[class_index] = observed_class_val / observed_class_sum;
        if (attribute_observers.length > 0) {
            for (let att_idx = 0; att_index < X.length; att_idx++) {
                if (attribute_observers.keys.indexOf(att_idx) >= 0) {
                    let obs = attribute_observers[att_idx]
                    votes[class_index] *= obs.probability_of_attribute_value_given_class(X[att_idx], class_index)
                }
            }
        }
    }
    return votes
}