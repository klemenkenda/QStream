class Stream{

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

    prepare_for_use() {
        /*
         * Prepare the stream for use. Can be the reading of a file, or
         * the generation of a function, or anything necessary for the
         * stream to work after its initialization.
         *
         * Notes
         * -----
         * Every time a stream is created this function has to be called.
         */
        throw 'Not implemented';
    }

    last_sample() {
        /**
         * Retrieves last `batch_size` samples in the stream.
         */
        return ([this.current_sample_x, this.current_sample_y]);
    }

    is_restartable() {
        /*
         * Determine if the stream is restartable.
         * Returns
         * -------
         * Boolean
         *    tTrue if stream is restartable.
         */
        return true;
    }

    restart() {
        /*
         * Restart the stream.
         */
        this.prepare_for_use();
    }

    n_remaining_samples() {
        /*
         * Returns the estimated number of remaining samples.
         *
         * Returns
         * -------
         * int
         *   Remaining number of samples. -1 if infinite (e.g. generator)
         */
        return (-1);
    }

    has_more_samples() {
        /* Checks if stream has more samples.
         *
         * Returns
         * -------
         * Boolean
         *    true if stream has more samples.
         */
        return (true);
    }

    get_data_info() {
        let info = this.name + '\n' + this.n_targets + ' targets\n' + this.n_classes + ' classes\n' + this.n_features + ' features';
        return (info);
    }

    get_class_type() {
        return 'stream';
    }
}

module.exports = Stream;