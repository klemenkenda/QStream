let Stream = require('./base_stream.js')
let Utils = require('../utils/utils.js')
class DataGenerator extends Stream {

    constructor(n_samples = 30000, has_noise = true, random_state = null){
        super();
        this.n_samples = n_samples;
        this.has_noise = has_noise;
        //this.n_features = n_features;
        //this.n_num_features = n_features
        //this.n_informative = n_informative;
        //this.n_targets = n_targets;
        this.random_state = random_state;
        this.name = ' '

        this.year = 365;
        this.day = 24;
        this.T_average_y = 10.0; //average temperature
        this.plus_minus_y = 20;
        this.plus_minus_d = 7;
        this.H_average = 75;

        this._configure()
    }

    _configure() {
        this.X = [];
        this.y = [];
    }

    prepare_for_use() {
        this.original_random_state = this.random_state == null ? false : true;
        this.random = new Utils.Random(this.random_state);
        this.sample_idx = 0;

        let regression = this._make_regression();
        this.X = regression[0];
        this.y = regression[1];
    }

    _make_regression() {
        //[temperature, humidity, wind,percip , snow, cloudcover, num_of, work_day, day_of_weak ]

        let random = this.random;
        let features = [];
        let energy = []
        let sample = null;
        let coin = null;

        let lala = 0;

        let T = null;
        let T_d = null;
        let T_min = null;
        let T_ave = new Average(this.day * 3);
        let T_average = null;

        let H = this.H_average;
        let vari = 15;
        let H_ave = new Average(this.day);
        let H_average = null;

        let W = null;
        let W_ave = new Average(this.day);
        let W_average = null;

        let DD = null;
        let NOP = null;
        let DOW = null;
        let HOUR = null;

        let CC = null;
        let CC_range_max = 10;
        let CC_range = random.random_int(this.original_random_state, 0, CC_range_max + 1);
        let CC_max = 0.7; 
        let CC_ave = new Average(this.day);
        let CC_average = null;

        let PER = null;
        let PER_ave = new Average(this.day);
        let PER_average = null;

        let SN = null;
        let SN_ave = new Average(this.day);
        let SN_average = null;

        let NOISE_n = 5;

        let ENERGY = null;

        for(let sample_n = 0; sample_n < this.n_samples  ; sample_n++){
            // day , hour , delovni dan, num of people, temperature, humidity, wind, cloud cower, percipitation, snow
            sample = [];
            //day
            DOW = Math.floor(sample_n / this.day % 7) + 1;
            sample.push(DOW); 
            //end
            //hour
            HOUR = Math.floor(sample_n % this.day) + 1;
            sample.push(HOUR);
            //end
            //delovni_dan
            if(Math.floor(sample_n / this.day % 7) == 6 || Math.floor(sample_n / this.day % 7) == 5) {
                DD = 0;
            }
            else {
                DD = 1;
            }
            sample.push(DD)
            //end
            // number of people
            if((sample_n % this.day) == 0) {
                NOP = random.random_int(this.original_random_state, 1, 8);
            }

            if(Math.floor(sample_n / this.day % 7) == 6 || Math.floor(sample_n/this.day % 7) == 5) {
                NOP = 0;
            }            
            sample.push(NOP)
            //end
            // temperature like feature
            let hour = sample_n % this.day
            if(hour == 0){
                T_d = this.plus_minus_y * Math.sin(2 / (this.year + this.day) * Math.PI * (sample_n + this.day / 2) 
                    - Math.PI / 2) + this.T_average_y + (random.random(this.original_random_state) * 10 - 5);
            }

            let T_h = 0
            let dayly_random = random.random(this.original_random_state) + 0.5;
            T_h = this.plus_minus_d * dayly_random * Math.sin(2 / this.day * Math.PI * hour - Math.PI / 2)
                + (random.random(this.original_random_state) - 0.5);
            T = T_d + T_h;
            T = Math.round(T * 100) / 100;
            sample.push(T);
            // end
            // humidity like feature ??
            lala = Math.pow(((H - this.H_average) / vari),3);
            H = H + (random.random(this.original_random_state) - 0.5 - lala) * 10;
            H = Math.round(H * 100) / 100;
            sample.push(H)
            //end
            // wind
            lala = Math.pow((W / 20), 3) * 2;
            W = W + (random.random(this.original_random_state)-0.5 - lala) * 3;
            if(W < 0){
                W = 0;
            }
            else {
                W = Math.round(W * 100) / 100;
            }
            sample.push(W)
            //end
            // cloud cover
            if(random.random_int(this.original_random_state, 0, this.day * 2.5) == 0) {
                CC_range = random.random_int(this.original_random_state, 0, CC_range_max + 1); // randomly change 
            }

            coin = random.random_int(this.original_random_state, 0, 3);

            CC_range = CC_range + coin - 1;
            
            if(CC_range > CC_range_max) {
                CC_range = CC_range_max;
            }
            if(CC_range < 0) {
                CC_range = 0;
            }
            
            CC = CC_range / CC_range_max 
               - 1 / CC_range_max + random.random(this.original_random_state) * 2 / CC_range_max;
            
            if(CC >= 1) {
                CC = 1;
            }
            if(CC <= 0) {
                CC = 0;
            }
            CC = Math.round(CC * 100) / 100;
            sample.push(CC);
            //end
            // perci
            if(hour == 0) {
                coin = random.random(this.original_random_state);
            }
            if(CC >= CC_max && coin >= 0.5) {
                PER = (CC - CC_max)/((1.0 - CC_max)) * Math.abs(random.random_gauss(this.original_random_state));
            }
            else {
                PER = 0;
            }
            PER = Math.round(PER * 100) / 100;
            sample.push(PER);
            //end
            // snow
            if(PER != 0 && T < 0) {
                SN = PER;
            }
            else {
                SN = 0;
            }
            sample.push(SN);
            //end
            // noise
            if(this.has_noise) {
                for(let i = 0; i < NOISE_n; i++) {
                    let noise = random.random_gauss(this.original_random_state);
                    noise = Math.round(noise * 100) / 100;
                    sample.push(noise);
                }
            }
            //end
            // regression function
            let some1 = 10;
            let ENERGY_1_1 = Math.pow(some1 - T, 2) * Math.sign(some1 - T) * 0.1 
                           + random.random_gauss(this.original_random_state) * 5;

            let some2 = 20;
            for(let i = 0; i < this.day; i++){
                if(i >= features.length){
                    break;
                }
                if(T_min == null){
                    T_min = features[features.length - i - 1][2];
                }
                else if(T_min > features[features.length - i - 1][2]){
                    T_min = features[features.length - i - 1][2];
                }
            }
            let ENERGY_1_2 = Math.pow(some2 - T_min, 2) * Math.sign(some2 - T_min) * 0.1 
                           + random.random_gauss(this.original_random_state) * 5;
            T_min = null;

            let some3 = 30;
            T_average = T_ave.next_average(T);
            let ENERGY_1_3 = Math.pow(some3 - T_average, 2) * Math.sign(some3 - T_average) * 0.2 
                           + random.random_gauss(this.original_random_state) * 5;

            let ENERGY_2_1 = H * 0.5 
                           + random.random_gauss(this.original_random_state) * 3;
            H_average = H_ave.next_average(H);
            let ENERGY_2_2 = H_average * 0.5
                           + random.random_gauss(this.original_random_state) * 3;

            W_average = W_ave.next_average(W);
            let ENERGY_3 = Math.pow(W_average, 2) * 3
                         + random.random_gauss(this.original_random_state) * 2;

            let ENERGY_4 = 0;
            if(DD == 0){
                ENERGY_4 = - 200 + random.random_gauss(this.original_random_state) * 4;
            }
            else {
                ENERGY_4 = 0;
            }
            let ENERGY_5 = - 5 * NOP + random.random_gauss(this.original_random_state) * 7;

            CC_average = CC_ave.next_average(CC);
            let ENERGY_6 = (CC_average - 1) * 100 + random.random_gauss(this.original_random_state) * 3;
            PER_average = PER_ave.next_average(PER);
            let ENERGY_7 = PER_average * 200 + random.random_gauss(this.original_random_state) * 5;
            SN_average = SN_ave.next_average(SN);
            let ENERGY_8 = SN_average * 300 + random.random_gauss(this.original_random_state) * 5;

            ENERGY = ENERGY_1_1 + ENERGY_1_2 + ENERGY_1_3 +
                    + ENERGY_2_1 + ENERGY_2_2
                    + ENERGY_3 + ENERGY_4 + ENERGY_5
                    + ENERGY_6 + ENERGY_7 + ENERGY_8;

            ENERGY = Math.round(ENERGY * 100) / 100;
            if (ENERGY <= 0) {
                ENERGY = 0;
            }
            energy.push(ENERGY)
            //sample.push(ENERGY)
            //end
            
            features.push(sample);
        }

        //return features;
        //return energy;
        return ([features, energy])
    }

    n_remaining_samples() {
        return (this.n_samples - this.sample_idx);
    }

    has_more_samples() {
        return (this.n_samples - this.sample_idx > 0);
    }

    next_sample(batch_size = 1) {
        this.sample_idx += batch_size;

        if(!this.has_more_samples()) {
            throw new RangeError("Can not create next sample.")
        }
        this.current_sample_x = this.X.slice(this.sample_idx - batch_size, this.sample_idx);
        this.current_sample_y = this.y.slice(this.sample_idx - batch_size, this.sample_idx);

        return ([this.current_sample_x, this.current_sample_y])
    }

    restart() {
        this.sample_idx = 0;
        this.current_sample_x = null;
        this.current_sample_y = null;
    }

    get_info() {
        let info = 'Generator:'
        + '\n n_samples: ' + this.n_samples

        return (info);
    }

}

// to gre v utils
class Average {
    constructor(sample_size) {
        this.sample_size = sample_size;
        this.sample = new Array(sample_size).fill(0);
    }

    next_average(num) {
        let reducer = (a, b) => a + b;
        for(let i = 0; i < this.sample_size - 1; i++){
            this.sample[this.sample_size - i - 1] = this.sample[this.sample_size - i - 2];
        }
        this.sample[0] = num;
        let average = this.sample.reduce(reducer) / this.sample_size;
        return average;
    }
}
module.exports = DataGenerator;