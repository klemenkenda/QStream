const WaveformGenerator =  require('../data/waveform_generator.js')
const assert = require('assert')

describe('waweform_generator', function() {
    describe('without noise', function() {
        let stream = new WaveformGenerator();
        stream.prepare_for_use();

        it('test if stream.n_remaining_samples == 1 ',function() {
            assert.equal(-1, stream.n_remaining_samples());
        });

        it('test feature names', function() {
            let expected_names = ['att_num_0', 'att_num_1', 'att_num_2', 'att_num_3', 'att_num_4',
                                  'att_num_5', 'att_num_6', 'att_num_7', 'att_num_8', 'att_num_9',
                                  'att_num_10', 'att_num_11', 'att_num_12', 'att_num_13', 'att_num_14',
                                  'att_num_15', 'att_num_16', 'att_num_17', 'att_num_18', 'att_num_19',
                                  'att_num_20'];
            for(let i = 0; i < stream.n_features; i++) {
                assert.equal(expected_names[i], stream.feature_names[i]);
            }
        });

        it('test expected targets', function() {
            let expected_targets = [0, 1, 2];
            for(let i = 0; i < stream.n_classes; i++) {
                assert.equal(expected_targets[i], stream.target_values[i]);
            }
        });

        it('test target names', function() {
            assert.equal('target_0', stream.target_names[0]);
        });

        it('test if n_features equal 21', function() {
            assert.equal(21, stream.n_features);
        });

        it('test n_cat_features', function() {
            assert.equal(0, stream.n_cat_features);
        });

        it('test n_num_features', function() {
            assert.equal(21, stream.n_num_features)
        });

        it('test n_targets', function() {
            assert.equal(1, stream.n_targets)
        })

        it('test info', function() {
            let expected_info = 'Waveform Generator:'
                                +'\n n_classes: 3'
                                +'\n n_num_features: 21'
                                +'\n n_cat_features: 0'
                                +'\n has_noise: false'
            assert.equal(expected_info, stream.get_info());
        });

        it('test if stream has more samples', function() {
            assert.equal(true, stream.has_more_samples());
        });

        it('test if stream is restartable', function() {
            assert.equal(true, stream.is_restartable())
        });

        it('test next_sample()', function() {
            next_sample = stream.next_sample();
            assert.equal(21, next_sample[0][0].length);
            assert.equal(1, next_sample[1].length);
            assert.ok(next_sample[1] == 0 || next_sample[1] == 1 || next_sample[1] ==2);
        });

        it('test next_sample(batch_size = 2)', function() {
            next_sample = stream.next_sample(2);
            assert.equal(21, next_sample[0][0].length);
            assert.equal(21, next_sample[0][1].length);
            assert.equal(2, next_sample[1].length);
            assert.ok(next_sample[1][0] == 0 || next_sample[1][0] == 1 || next_sample[1][0] == 2);
            assert.ok(next_sample[1][1] == 0 || next_sample[1][1] == 1 || next_sample[1][1] == 2);
        });

        it('test if average of waveform samples is simetric', function() {
            let stream2 = new WaveformGenerator(has_noise = false, random_state = 77);
            stream2.prepare_for_use();

            let n = 2000;
            samples = stream2.next_sample(n);
            for(let j = 0; j != 11; j++) {
                let sum1 = 0;
                let sum2 = 0;
                for(let i = 1; i < n; i++) {
                    sum1 = sum1 + samples[0][i][j];
                    sum2 = sum2 + samples[0][i][20-j];
                }
            assert.ok(Math.round(sum1/n*10) - Math.round(sum2/n*10) < 2);
            }
        });

        it('test last_sample()', function() {
            next_sample = stream.next_sample(2);
            last_sample = stream.last_sample();
            for(let i = 0; i < stream.n_features; i++) {
                assert.equal(next_sample[0][0][i], last_sample[0][0][i]);
                assert.equal(next_sample[0][1][i], last_sample[0][1][i]);
            }
            for(let i = 0; i < 2; i++) {
                assert.equal(next_sample[1][i], last_sample[1][i]);
                assert.equal(next_sample[1][i], last_sample[1][i]);
            }
        });

    });

    describe('with noise', function() {
        let stream = new WaveformGenerator(has_noise = true);
        stream.prepare_for_use;
        
        it('test if stream.n_remaining_samples == 1 ', function() {
            assert.equal(-1, stream.n_remaining_samples());
        });

        it('test feature names', function() {
            let expected_names = ['att_num_0', 'att_num_1', 'att_num_2', 'att_num_3', 'att_num_4',
                                  'att_num_5', 'att_num_6', 'att_num_7', 'att_num_8', 'att_num_9',
                                  'att_num_10', 'att_num_11', 'att_num_12', 'att_num_13', 'att_num_14',
                                  'att_num_15', 'att_num_16', 'att_num_17', 'att_num_18', 'att_num_19',
                                  'att_num_20', 'att_num_21', 'att_num_22', 'att_num_23', 'att_num_24',
                                  'att_num_25', 'att_num_26', 'att_num_27', 'att_num_28', 'att_num_29',
                                  'att_num_30', 'att_num_31', 'att_num_32', 'att_num_33', 'att_num_34',
                                  'att_num_35', 'att_num_36', 'att_num_37', 'att_num_38', 'att_num_39',
                                  ];
            for(let i = 0; i < stream.n_features; i++) {
                assert.equal(expected_names[i], stream.feature_names[i]);
            }
        });

        it('test expected targets', function() {
            let expected_targets = [0, 1, 2];
            for(let i = 0; i < stream.n_classes; i++) {
                assert.equal(expected_targets[i], stream.target_values[i]);
            }
        });

        it('test target names', function() {
            assert.equal('target_0', stream.target_names[0]);
        });

        it('test if n_features equal 40', function() {
            assert.equal(40, stream.n_features);
        });

        it('test n_cat_features', function() {
            assert.equal(0, stream.n_cat_features);
        });

        it('test n_num_features', function() {
            assert.equal(40, stream.n_num_features)
        });

        it('test n_targets', function() {
            assert.equal(1, stream.n_targets)
        })

        it('test info', function() {
            let expected_info = 'Waveform Generator:'
                                +'\n n_classes: 3'
                                +'\n n_num_features: 40'
                                +'\n n_cat_features: 0'
                                +'\n has_noise: true'
            assert.equal(expected_info, stream.get_info());
        });

        it('test if stream has more samples', function() {
            assert.equal(true, stream.has_more_samples());
        });

        it('test if stream is restartable', function() {
            assert.equal(true, stream.is_restartable())
        });

        it('test next_sample()', function() {
            next_sample = stream.next_sample();
            assert.equal(40, next_sample[0][0].length);
            assert.equal(1, next_sample[1].length);
            assert.ok(next_sample[1] == 0 || next_sample[1] == 1 || next_sample[1] ==2);
        });

        it('test next_sample(batch_size = 2)', function() {
            next_sample = stream.next_sample(2);
            assert.equal(40, next_sample[0][0].length);
            assert.equal(40, next_sample[0][1].length);
            assert.equal(2, next_sample[1].length);
            assert.ok(next_sample[1][0] == 0 || next_sample[1][0] == 1 || next_sample[1][0] == 2);
            assert.ok(next_sample[1][1] == 0 || next_sample[1][1] == 1 || next_sample[1][1] == 2);
        });

        it('test if average of waveform samples is simetric', function() {
            let stream2 = new WaveformGenerator(has_noise = false, random_state = 777);
            stream2.prepare_for_use();

            let n = 2000;
            samples = stream2.next_sample(n);
            for(let j = 0; j != 11; j++) {
                let sum1 = 0;
                let sum2 = 0;
                for(let i = 1; i < n; i++) {
                    sum1 = sum1 + samples[0][i][j];
                    sum2 = sum2 + samples[0][i][20-j];
                }
            assert.ok(Math.round(sum1/n*10) - Math.round(sum2/n*10) < 2);
            }
        });

        it('test last_sample()', function() {
            next_sample = stream.next_sample(2);
            last_sample = stream.last_sample();
            for(let i = 0; i < stream.n_features; i++) {
                assert.equal(next_sample[0][0][i], last_sample[0][0][i]);
                assert.equal(next_sample[0][1][i], last_sample[0][1][i]);
            }
            for(let i = 0; i < 2; i++) {
                assert.equal(next_sample[1][i], last_sample[1][i]);
                assert.equal(next_sample[1][i], last_sample[1][i]);
            }
        });
    });
});
