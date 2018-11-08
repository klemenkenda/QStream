const WaveformGenerator =  require('../data/waveform_generator.js')
const assert = require('assert')

let stream = new WaveformGenerator();
stream.prepare_for_use;

describe('waweform_generator', function() {
    describe('witout noise', function() {
        it('test if stream.n_remaining_samples == 1 ',function(){
            assert.equal(-1, stream.n_remaining_samples());
        });

        let expected_names = ['att_num_0', 'att_num_1', 'att_num_2', 'att_num_3', 'att_num_4',
                              'att_num_5', 'att_num_6', 'att_num_7', 'att_num_8', 'att_num_9',
                              'att_num_10', 'att_num_11', 'att_num_12', 'att_num_13', 'att_num_14',
                              'att_num_15', 'att_num_16', 'att_num_17', 'att_num_18', 'att_num_19',
                              'att_num_20'];
        it('test feature names', function(){
            for(let i = 0; i<stream.n_features; i++){
                assert.equal(expected_names[i], stream.feature_names[i]);
            }
        });

        let expected_targets = [0, 1, 2];
        it('test expected targets', function(){
            for(let i = 0; i<stream.n_classes; i++){
                assert.equal(expected_targets[i], stream.target_values[i]);
            }
        });

        it('test target names',function(){
            assert.equal('target_0', stream.target_names[0]);
        });

        it('test if n_features equal 21',function(){
            assert.equal(21, stream.n_features);
        });
    });
});
