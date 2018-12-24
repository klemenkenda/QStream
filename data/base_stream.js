/** Abstract class for a stream generator. */
class Stream {
    /**
     * Create the stream generator and initialize the properties.
     */
    constructor() {
        this.n_samples = 0;
        this.n_targets = 0;
        this.n_features = 0;
        this.n_num_features = 0;
        this.n_cat_features = 0;
        this.n_classes = 0;
        this.cat_features_idx = []
        this.current_sample_x = null;
        this.current_sample_y = null;
        this.sample_idx = 0;
        this.feature_names = null;
        this.target_names = null;
        this.target_values = null;
        this.name = null;
    }

    /**
     * Prepare the stream for use. Can be the reading of a file, or
     * the generation of a function, or anything necessary for the
     * stream to work after its initialization.
     *
     * Notes
     * -----
     * Every time a stream is created this function has to be called.
     */
    prepare_for_use() {
        throw 'Not implemented';
    }

    /**
     * Retrieves last `batch_size` samples in the stream.
     */
    last_sample() {
        return ([this.current_sample_x, this.current_sample_y]);
    }

    /**
     * Determine if the stream is restartable.
     * @return {boolean} - tTrue if stream is restartable.
     */
    is_restartable() {
        return true;
    }

    /** 
     * Restart the stream.
     */
    restart() {
        this.prepare_for_use();
    }

    /** 
     * Returns the estimated number of remaining samples.
     * 
     * @return {int} - Remaining number of samples. -1 if infinite (e.g. generator)
     */
    n_remaining_samples() {
        return (-1);
    }

    /** Checks if stream has more samples.
     *
     * @return {boolean} - true if stream has more samples.
     */
    has_more_samples() {

        return (true);
    }

    /**
     * @return {string} -Info
     */
    get_data_info() {
        let info = this.name + '\n' + this.n_targets + ' targets\n' + this.n_classes + ' classes\n' + this.n_features + ' features';
        return (info);
    }

    /**
     * @return {string}
     */
    get_class_type() {
        return 'stream';
    }
}

module.exports = Stream;