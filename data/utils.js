class Utils {
    constructor(seed = 7777) {
        this.seed = seed;
    }
    random(random_state = false) {
        /**
         * If random_state = true crreates a pseudo-random value generator.
         * The seed must be an integer.
         *
         * Uses an optimized version of the Park-Miller PRNG.
         */

        if(random_state) {
            this.seed = this.seed % 2147483647;
            if (this.seed <= 0) {
                this.seed += 2147483647;
            }

            this.seed = this.seed * 16807 % 2147483647;
            let float = (this.seed - 1) / 2147483646;
            return (float);
        }
        else {
            return (Math.random());
        }

    }

    random_int(random_state, min, max) {
        /**
         * Random int between min (included) and max (excluded)
         */
        let rand_int = Math.floor(this.random(random_state = random_state) * (max - min)) + min;
        return (rand_int);
    }

    rand_gauss(random_state = false) {
        // generate gaussian random 
        let u = 0;
        let v = 0;
        while (u === 0) u = this.random(random_state = random_state);; //Converting [0,1) to (0,1)
        while (v === 0) v = this.random(random_state = random_state);;
        return (Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v));
    }
}
module.exports = Utils;