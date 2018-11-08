class Stream{

    constructor(){
        this.n_samples = 0;
        this.n_targets = 0;
        this.n_features = 0
        this.n_num_features = 0
        this.n_cat_features = 0
        this.n_classes = 0
        this.cat_features_idx = []
        this.current_sample_x = null
        this.current_sample_y = null
        this.sample_idx = 0
        this.feature_names = null
        this.target_names = null
        this.target_values = null
        this.name = null
    }
    
    prepare_for_use(){
        throw 'Not implemented';
    }

    last_sample(){
        /** 
        * Retrieves last `batch_size` samples in the stream.
         */
        return ([this.current_sample_x, this.current_sample_y]);
    }

    is_restartable(){
        return true;
    }

    restart(){
        this.prepare_for_use()
    }

    n_remaining_samples(){
        return (-1);
    }

    has_more_samples(){
        return (true);
    }

    get_data_info(){
        let info = this.name + '\n' +this.n_targets + ' targets\n'+ this.n_classes + ' classes\n' + this.n_features + ' features';
        return (info);
    }
}
module.exports = Stream;