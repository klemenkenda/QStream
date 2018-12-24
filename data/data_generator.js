let Stream = require('./base_stream.js')
let Utils = require('../utils/index.js')
class DataGenerator extends Stream {
    /** DataGenerator
     * 
     * This generator creates a stream of samples ...
     * 
     * @param {int} n_samples
     * @param {bool} has_noise
     * @param {int} random_state
     * @param {int} year
     * @param {int} day
     * 
     */

    constructor(n_samples = 100, has_noise = false, random_state = null, year = 365, day = 6, season = true) {
        super();
        this.n_samples = n_samples;
        this.has_noise = has_noise;
        this.random_state = random_state;
        this.name = ' '

        this.year = year;
        this.day = day;
        this.season = season;
        this._configure();
    };

    _configure() {
        this.X = [];
        this.y = [];
        this.n_features = this.has_noise ? 16 : 11;
        this.feature_names = [];
        for (let i = 1; i < this.n_features + 1; i++) {
            this.feature_names.push('att_num_' + i);
        };
        this.feature_1_average_y = 10.0;
        this.plus_minus_y = 20;
        this.plus_minus_d = 7;
        this.feature_2_average = 75;
    };

    /**
     * Should be called before generating the samples.
     */
    prepare_for_use() {
        this.original_random_state = this.random_state == null ? false : true;
        this.random = new Utils.Random(this.random_state);
        this.sample_idx = 0;

        let regression = this._make_regression();
        this.X = regression[0];
        this.y = regression[1];
    };

    /**
     * Create samples and make regression.
     */
    _make_regression() {
        //[temperature, humidity, wind,percip , snow, cloudcover, num_of, work_day, day_of_weak, season ]
        let random = this.random;
        let features = [];
        let energy = []
        let sample = null;
        let coin = null;

        let control_features = 0;

        let feature_1 = null;
        let feature_1_d = null;
        let feature_1_min = null;
        let class_object_average = new Utils.Average(this.day * 3);
        let feature_1_average_last_3_days = null;

        let feature_2 = this.feature_2_average;
        let feature_2_vari = 15;
        let feature_2_ave = new Utils.Average(this.day);
        let feature_2_average = null;

        let feature_3 = null;
        let feature_3_ave = new Utils.Average(this.day);
        let feature_3_average = null;

        let feature_4 = null;
        let feature_5 = null;
        let DOW = null;
        let HOUR = null;

        let feature_6 = null;
        let feature_6_range_max = 10;
        let feature_6_range = random.random_int(this.original_random_state, 0, feature_6_range_max + 1);
        let feature_6_max = 0.7; 
        let feature_6_ave = new Utils.Average(this.day);
        let feature_6_average = null;

        let feature_7 = null;
        let feature_7_ave = new Utils.Average(this.day);
        let feature_7_average = null;

        let feature_8 = null;
        let feature_8_ave = new Utils.Average(this.day);
        let feature_8_average = null;

        let SEASON = null;

        let NOISE_n = 5;

        let ENERGY = null;

        for (let sample_n = 0; sample_n < this.n_samples  ; sample_n++) {
            // day , hour , work day, num of people, temperature, humidity, wind, cloud cower, percipitation, snow
            sample = [];
            // temperature like feature
            let hour = sample_n % this.day;
            if(hour == 0) {
                feature_1_d = this.plus_minus_y * Math.sin(2 / (this.year * this.day) * Math.PI * (sample_n + this.day / 2) 
                    - Math.PI / 2) + this.feature_1_average_y + (random.random(this.original_random_state) * 10 - 5);
            };
            let feature_1_h = 0
            let dayly_random = random.random(this.original_random_state) + 0.5;
            feature_1_h = this.plus_minus_d * dayly_random * Math.sin(2 / this.day * Math.PI * hour - Math.PI / 2)
                + (random.random(this.original_random_state) - 0.5);
            feature_1 = feature_1_d + feature_1_h;
            feature_1 = Math.round(feature_1 * 100) / 100;
            sample.push(feature_1);
            // end
            // humidity
            control_features = Math.pow(((feature_2 - this.feature_2_average) / feature_2_vari), 3);
            feature_2 = feature_2 + (random.random(this.original_random_state) - 0.5 - control_features) * 10;
            feature_2 = Math.round(feature_2 * 100) / 100;
            sample.push(feature_2)
            //end
            // wind
            control_features = Math.pow((feature_3 / 10), 2);
            feature_3 = feature_3 + (random.random(this.original_random_state) - 0.5 - control_features) * 3;
            if(feature_3 < 0) {
                feature_3 = 0;
            } else {
                feature_3 = Math.round(feature_3 * 100) / 100;
            };
            sample.push(feature_3)
            //end
            //work day
            if(Math.floor(sample_n / this.day % 7) == 6 || Math.floor(sample_n / this.day % 7) == 5) {
                feature_4 = 0;
            } else {
                feature_4 = 1;
            };
            sample.push(feature_4)
            //end
            // number of people
            if((sample_n % this.day) == 0) {
                feature_5 = random.random_int(this.original_random_state, 1, 8);
            };

            if(Math.floor(sample_n / this.day % 7) == 6 || Math.floor(sample_n/this.day % 7) == 5) {
                feature_5 = 0;
            }            
            sample.push(feature_5)
            //end
            // cloud cover
            if(random.random_int(this.original_random_state, 0, this.day * 2.5) == 0) {
                feature_6_range = random.random_int(this.original_random_state, 0, feature_6_range_max + 1); // randomly change 
            };

            coin = random.random_int(this.original_random_state, 0, 3);

            feature_6_range = feature_6_range + coin - 1;
            
            if(feature_6_range > feature_6_range_max) {
                feature_6_range = feature_6_range_max;
            };
            if(feature_6_range < 0) {
                feature_6_range = 0;
            };
            
            feature_6 = feature_6_range / feature_6_range_max 
               - 1 / feature_6_range_max + random.random(this.original_random_state) * 2 / feature_6_range_max;
            
            if(feature_6 >= 1) {
                feature_6 = 1;
            };
            if(feature_6 <= 0) {
                feature_6 = 0;
            };
            feature_6 = Math.round(feature_6 * 100) / 100;
            sample.push(feature_6);
            //end
            // percipitation
            if(hour == 0) {
                coin = random.random(this.original_random_state);
            };
            if(feature_6 >= feature_6_max && coin >= 0.5) {
                feature_7 = (feature_6 - feature_6_max)/((1.0 - feature_6_max)) * Math.abs(random.random_gauss(this.original_random_state));
            } else {
                feature_7 = 0;
            };
            feature_7 = Math.round(feature_7 * 100) / 100;
            sample.push(feature_7);
            //end
            // snow
            if(feature_7 != 0 && feature_1 < 0) {
                feature_8 = feature_7;
            } else {
                feature_8 = 0;
            };
            sample.push(feature_8);
            //end
            //season
            if(((sample_n + Math.round((this.day * this.year) / 4)) % (this.day * this.year)) < (this.day * this.year) / 2 ) {
                SEASON = 1;
            } else {
                SEASON = 0;
            };
            sample.push(SEASON);
            //end
            // noise
            if(this.has_noise) {
                for (let i = 0; i < NOISE_n; i++) {
                    let noise = random.random_gauss(this.original_random_state);
                    noise = Math.round(noise * 100) / 100;
                    sample.push(noise);
                };
            };
            //end
            //day of week
            DOW = Math.floor(sample_n / this.day % 7) + 1;
            sample.push(DOW); 
            //end
            //hour
            HOUR = Math.floor(sample_n % this.day) + 1;
            sample.push(HOUR);
            //end
            // regression function
            let some1 = 10;
            let ENERGY_1_1 = Math.pow(some1 - feature_1, 2) * Math.sign(some1 - feature_1) * 0.1 
                           + random.random_gauss(this.original_random_state) * 5;

            let some2 = 20;
            for (let i = 0; i < this.day; i++) {
                if(i >= features.length) {
                    break;
                };
                if(feature_1_min == null) {
                    feature_1_min = features[features.length - i - 1][2];
                } else if(feature_1_min > features[features.length - i - 1][2]) {
                    feature_1_min = features[features.length - i - 1][2];
                };
            };
            let ENERGY_1_2 = Math.pow(some2 - feature_1_min, 2) * Math.sign(some2 - feature_1_min) * 0.1 
                           + random.random_gauss(this.original_random_state) * 5;
            feature_1_min = null;

            let some3 = 30;
            feature_1_average_last_3_days = class_object_average.next_average(feature_1);
            let ENERGY_1_3 = Math.pow(some3 - feature_1_average_last_3_days, 2) * Math.sign(some3 - feature_1_average_last_3_days) * 0.2 
                           + random.random_gauss(this.original_random_state) * 5;

            let ENERGY_2_1 = feature_2 * 0.5 
                           + random.random_gauss(this.original_random_state) * 3;
            feature_2_average = feature_2_ave.next_average(feature_2);
            let ENERGY_2_2 = feature_2_average * 0.5
                           + random.random_gauss(this.original_random_state) * 3;

            feature_3_average = feature_3_ave.next_average(feature_3);
            let ENERGY_3 = Math.pow(feature_3_average, 2) * 3
                         + random.random_gauss(this.original_random_state) * 2;

            let ENERGY_4 = 0;
            if(feature_4 == 0) {
                ENERGY_4 = - 200 + random.random_gauss(this.original_random_state) * 4;
            } else {
                ENERGY_4 = 0;
            };
            let ENERGY_5 = - 5 * feature_5 + random.random_gauss(this.original_random_state) * 7;

            feature_6_average = feature_6_ave.next_average(feature_6);
            let ENERGY_6 = (feature_6_average - 1) * 100 + random.random_gauss(this.original_random_state) * 3;
            feature_7_average = feature_7_ave.next_average(feature_7);
            let ENERGY_7 = feature_7_average * 200 + random.random_gauss(this.original_random_state) * 5;
            feature_8_average = feature_8_ave.next_average(feature_8);
            let ENERGY_8 = feature_8_average * 300 + random.random_gauss(this.original_random_state) * 5;

            ENERGY = ENERGY_1_1 + ENERGY_1_2 + ENERGY_1_3 +
                    + ENERGY_2_1 + ENERGY_2_2
                    + ENERGY_3 + ENERGY_4 + ENERGY_5
                    + ENERGY_6 + ENERGY_7 + ENERGY_8;

            ENERGY = Math.round(ENERGY * 100) / 100;
            if (ENERGY <= 0) {
                ENERGY = 0;
            };
            if (SEASON == 0 && this.season) {
                ENERGY = 0;
            };
            energy.push(ENERGY)
            //sample.push(ENERGY)
            //end
            features.push(sample);
        };
        return ([features, energy])
    };

    /** n_remaining_samples()
     * @returns Number of samples remaining.
     */
    n_remaining_samples() {
        return (this.n_samples - this.sample_idx);
    };

    /** has_more_samples()
     * @returns True if stream has more samples.
     */
    has_more_samples() {
        return (this.n_samples - this.sample_idx > 0);
    };

    /** next_sample
     * 
     * Returns batch_size generated  samples- 
     * 
     * @param {int} batch_size -The number of samples to return.
     * @returns {array} - Return an array with the features matrix and the labels
     *     matrix for the batch_size samples that were requested.
     * 
     */
    next_sample(batch_size = 1) {
        this.sample_idx += batch_size;

        if(!this.has_more_samples()) {
            throw new RangeError("Can not create next sample.")
        };
        this.current_sample_x = this.X.slice(this.sample_idx - batch_size, this.sample_idx);
        this.current_sample_y = this.y.slice(this.sample_idx - batch_size, this.sample_idx);

        return ([this.current_sample_x, this.current_sample_y])
    };

    /** restart()
     * 
     * Restart the stream to the initial state.
     */
    restart() {
        this.sample_idx = 0;
        this.current_sample_x = null;
        this.current_sample_y = null;
    };
    /** get_info()
     * 
     * Get info.
     */
    get_info() {
        let info = 'Generator:'
        + '\n n_samples: ' + this.n_samples

        return (info);
    };
};
module.exports = DataGenerator;
