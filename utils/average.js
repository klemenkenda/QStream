class Average {
    /**
     * Class that helps calculate average fo last num_of_samples average.
     * 
     * @param {} num_of_samples nuber of samples taken to calculate average
     */

    constructor(num_of_samples = 24) {
        this.num_of_samples = num_of_samples;
        this.sample = new Array(num_of_samples).fill(0);
    };

    next_average(num) {
        /**
         * Average with new number.
         * 
         * @param {float}  num new number added to calculate average. 
         * 
         * @returns average
         */

        let reducer = (a, b) => a + b;
        for (let i = 0; i < this.num_of_samples - 1; i++) {
            this.sample[this.num_of_samples - i - 1] = this.sample[this.num_of_samples - i - 2];
        };
        this.sample[0] = num;
        let average = this.sample.reduce(reducer) / this.num_of_samples;
        return (average);
    };
};
module.exports = Average;