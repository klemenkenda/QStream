class Random {
    /**
     * 
     * @param {int} seed - Seed for pseudo random generator.
     */
    constructor(seed = 7777) {
        this.seed = seed;
    }
    random(random_state = false) {
        /**
         * Generates (psudo) random float.
         * Uses an optimized version of the Park-Miller PRNG.
         * @param {boolean} random_state - If trure pseudo random else random.
         * @return {float} - Raturns (pseudo) random float in interval [0,1).
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
         * Generates (psudo) random integer.
         * 
         * @param {boolean} random_state - If trure pseudo random else random.
         * @param {int} min - Minimum integer.
         * @param {int} max - Max integer
         * @return {int} - Returns (pseudo) random int between min (included) and max (excluded)
         */

        let rand_int = Math.floor(this.random(random_state = random_state) * (max - min)) + min;
        return (rand_int);
    }

    random_gauss(random_state = false) {
        /** 
         * Standard Gaussian distribution using Box-Muller transform.
         * 
         * @param {boolean} random_state - If trure pseudo random else random.
         * @return {float} - Returns (pseudo) random floath with gaussian distribution.
         */
        let u = 0;
        let v = 0;
        while (u === 0) u = this.random(random_state = random_state);; //Converting [0,1) to (0,1)
        while (v === 0) v = this.random(random_state = random_state);;
        return (Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v));
    }
}
module.exports = Random;