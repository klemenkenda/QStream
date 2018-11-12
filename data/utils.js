class Utils {
    /**
     * Utils to be used with data constructs of QStream.
     * Will be moved to root as we shold put here all the utils also for
     * other parts of the library.
     */
    constructor() {
        // nothing to do
    }

    /**
     * Random gaussian generator.
     */
    rand_gauss() {
        // generate gaussian random
        let u = 0;
        let v = 0;
        while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        return (Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v));
    }
}
module.exports = Utils;