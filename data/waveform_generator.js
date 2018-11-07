class WaveformGenerator{

    constructor(has_noise = false, random_state = null){
        
        this.original_random_state = random_state; // random state not used
        this.random_state = null; 
        this.has_noise = has_noise;

        this.n_featu = 21; // number of features when has_noise = false
    	this.n_num_features = this.n_featu;
        this.n_classes = 3;
        this.n_targets = 1;
        this.h_function = [[0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                           [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1, 0],
                           [0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0]]

        this.name = "Waveform Generator";

        this.configure();
    }

//configure check later
    configure(){
        if (this.has_noise){
            this.n_num_features = 40; // number of features when has_noise = true
        }
        this.n_features = this.n_num_features;
        //še nekaj
    }

    has_noise(){
        /* Retrieve the value of the option: add noise.

        Returns
        -------
        Boolean
            True if the noise is added.
         */
        
        return this.has_noise
    }

    set_has_noise(has_noise){
        /* Set the value of the option: add noise.

        Parameters
        ----------
        has_noise: Boolean

         */
        if (typeof(has_noise) === 'boolean'){
            this.has_noise = has_noise;
            this.configure();
        }
        else{console.log('It is not boolean')} //error
    }


    prepare_for_use(){
        /*
         Should be called before generating the samples.
         */
        
        //self.random_state = check_random_state(self._original_random_state)
        this.sample_idx = 0
    }


    next_sample(batch_size = 1){
        /*  next_sample
        
        An instance is generated based on the parameters passed. If noise 
        is included the total number of features will be 40, if it's not
        included there will be 21 attributes. In both cases there is one 
        classification task, which chooses one between three labels.
        
        After the number of attributes is chosen, the algorithm will randomly
        choose one of the hard coded waveforms, as well as random multipliers. 
        For each attribute, the actual value generated will be a a combination 
        of the hard coded functions, with the multipliers and a random value.
        
        Furthermore, if noise is added the features from 21 to 40 will be
        replaced with a random normal value.
        
        Parameters
        ----------
        batch_size: int
            The number of samples to return.
            
        Returns
        -------
        tuple or tuple list
            Return a tuple with the features matrix and the labels matrix 
            for the batch_size samples that were requested.
        
        */

        function rand_gauss() {
            // generate gaussian random 
            var u = 0, v = 0;
            while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
            while(v === 0) v = Math.random();
            return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
        }

        var data = [];
        var dimensions = [batch_size, this.n_features + 1]
        for (var i = 0; i < dimensions[0]; ++i) {
            data.push(new Array(dimensions[1]).fill(0));
        };

        for(let j = 0; j < batch_size; j++){
            this.sample_idx += 1;
            var group = Math.floor(Math.random() * this.n_classes);
            var choice_a = group == 2 ? 1 : 0;
            var choice_b = group == 0 ? 1 : 2;
            var multiplier_a = Math.random();
            var multiplier_b = 1.0 - multiplier_a;

            for (let i = 0; i <= this.n_featu-1; i++){
                data[j][i] = multiplier_a * this.h_function[choice_a][i] + multiplier_b * this.h_function[choice_b][i] + rand_gauss();
            };


            if(this.has_noise){
                for (let i = this.n_featu; i < this.n_num_features; i++){
                    data[j][i] = rand_gauss();
                };
            };

            data[j][data[j].length -1] = group;
            
            
        }
        let current_sample_x = [];
        let current_sample_y = [];

        for (let k = 0; k < batch_size; k++){
            current_sample_x.push(data[k].slice(0, this.n_num_features));
            current_sample_y.push(data[k][this.n_num_features]);

        }

        return [current_sample_x, current_sample_y]
    }


    get_info(){
        var info = 'Waveform Generator:'
        +' \n n_classes: ' + this.n_classes  
        +'\n n_num_features: ' + this.n_num_features
        +'\n has_noise: ' + this.has_noise
      //  +'\n random_state: ' + this._original_random_state;

        return info
    }


}