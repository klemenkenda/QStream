const generator =  require('../data/index.js')
const assert = require('assert')

describe('waveform_generator', function() {
    describe('without noise', function() {
        let stream = new generator.WaveformGenerator();
        stream.prepare_for_use();

        it('should be -1 remainin samples ',function() {
            assert.equal(-1, stream.n_remaining_samples());
        });

        it('test if feature names are correct', function() {
            let expected_names = ['att_num_0', 'att_num_1', 'att_num_2', 'att_num_3', 'att_num_4',
                                  'att_num_5', 'att_num_6', 'att_num_7', 'att_num_8', 'att_num_9',
                                  'att_num_10', 'att_num_11', 'att_num_12', 'att_num_13', 'att_num_14',
                                  'att_num_15', 'att_num_16', 'att_num_17', 'att_num_18', 'att_num_19',
                                  'att_num_20'];
            for(let i = 0; i < stream.n_features; i++) {
                assert.equal(expected_names[i], stream.feature_names[i]);
            };
        });

        it('expected targets should be [0, 1, 2]', function() {
            let expected_targets = [0, 1, 2];

            for(let i = 0; i < stream.n_classes; i++) {
                assert.equal(expected_targets[i], stream.target_values[i]);
            };
        });

        it('target_names should be \'target_0\'', function() {
            assert.equal('target_0', stream.target_names[0]);
        });

        it('should be 21 fatures', function() {
            assert.equal(21, stream.n_features);
        });

        it('should be 0 categorical features', function() {
            assert.equal(0, stream.n_cat_features);
        });

        it('should be 21 numerical features', function() {
            assert.equal(21, stream.n_num_features)
        });

        it('should be 1 target', function() {
            assert.equal(1, stream.n_targets)
        })

        it('test if data info is correct', function() {
            let expected_info = 'Waveform Generator:'
                                + '\n n_classes: 3'
                                + '\n n_num_features: 21'
                                + '\n n_cat_features: 0'
                                + '\n has_noise: false';

            assert.equal(expected_info, stream.get_info());
        });

        it('stream should have more samples', function() {
            assert.equal(true, stream.has_more_samples());
        });

        it('stream should be restartable', function() {
            assert.equal(true, stream.is_restartable())
        });

        it('feature sample should have lenght 21 and labels 1, labels should be 0 or 1 or 2', function() {
            next_sample = stream.next_sample();
            assert.equal(21, next_sample[0][0].length);
            assert.equal(1, next_sample[1].length);
            assert.ok(next_sample[1] == 0 || next_sample[1] == 1 || next_sample[1] ==2);
        });

        it('all features of samples should have lenght 21 and labels 1, labels should be 0 or 1', function() {
            next_sample = stream.next_sample(2);
            assert.equal(21, next_sample[0][0].length);
            assert.equal(21, next_sample[0][1].length);
            assert.equal(2, next_sample[1].length);
            assert.ok(next_sample[1][0] == 0 || next_sample[1][0] == 1 || next_sample[1][0] == 2);
            assert.ok(next_sample[1][1] == 0 || next_sample[1][1] == 1 || next_sample[1][1] == 2);
        });

        it('average of waveform samples should be simetric', function() {
            let stream2 = new generator.WaveformGenerator(has_noise = false, random_state = 77);
            stream2.prepare_for_use();

            let n = 500;
            samples = stream2.next_sample(n);
            for(let j = 2; j != 11; j++) {
                let sum1 = 0;
                let sum2 = 0;
                for(let i = 0; i < n; i++) {
                    sum1 = sum1 + samples[0][i][j];
                    sum2 = sum2 + samples[0][i][20 - j];
                };
            assert.ok(Math.abs(Math.round(sum1 / n * 10) - Math.round(sum2 / n * 10)) <= 3);
            };
        });

        it('last sample should be the same as next sample called before', function() {
            next_sample = stream.next_sample(2);
            last_sample = stream.last_sample();

            for(let i = 0; i < stream.n_features; i++) {
                assert.equal(next_sample[0][0][i], last_sample[0][0][i]);
                assert.equal(next_sample[0][1][i], last_sample[0][1][i]);
            };

            for(let i = 0; i < 2; i++) {
                assert.equal(next_sample[1][i], last_sample[1][i]);
                assert.equal(next_sample[1][i], last_sample[1][i]);
            };
        });

    });

    describe('with noise', function() {
        let stream = new generator.WaveformGenerator(has_noise = true);
        stream.prepare_for_use();
        
        it('should be -1 remainin samples ', function() {
            assert.equal(-1, stream.n_remaining_samples());
        });

        it('test if feature names are correct', function() {
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
            };
        });

        it('expected targets should be [0, 1, 2]', function() {
            let expected_targets = [0, 1, 2];

            for(let i = 0; i < stream.n_classes; i++) {
                assert.equal(expected_targets[i], stream.target_values[i]);
            };
        });

        it('target_names should be \'target_0\'', function() {
            assert.equal('target_0', stream.target_names[0]);
        });

        it('should be 40 fatures', function() {
            assert.equal(40, stream.n_features);
        });

        it('should be 0 categorical features', function() {
            assert.equal(0, stream.n_cat_features);
        });

        it('should be 40 numerical features', function() {
            assert.equal(40, stream.n_num_features)
        });

        it('should be 1 target', function() {
            assert.equal(1, stream.n_targets)
        })

        it('test if data info is correct', function() {
            let expected_info = 'Waveform Generator:'
                                + '\n n_classes: 3'
                                + '\n n_num_features: 40'
                                + '\n n_cat_features: 0'
                                + '\n has_noise: true'
            assert.equal(expected_info, stream.get_info());
        });

        it('stream should have more samples', function() {
            assert.equal(true, stream.has_more_samples());
        });

        it('stream should be restartable', function() {
            assert.equal(true, stream.is_restartable())
        });

        it('feature sample should have lenght 40 and labels 1, labels should be 0 or 1 or 2', function() {
            next_sample = stream.next_sample();
            assert.equal(40, next_sample[0][0].length);
            assert.equal(1, next_sample[1].length);
            assert.ok(next_sample[1] == 0 || next_sample[1] == 1 || next_sample[1] ==2);
        });

        it('all features of samples should have lenght 40 and labels 1, labels should be 0 or 1', function() {
            next_sample = stream.next_sample(2);
            assert.equal(40, next_sample[0][0].length);
            assert.equal(40, next_sample[0][1].length);
            assert.equal(2, next_sample[1].length);
            assert.ok(next_sample[1][0] == 0 || next_sample[1][0] == 1 || next_sample[1][0] == 2);
            assert.ok(next_sample[1][1] == 0 || next_sample[1][1] == 1 || next_sample[1][1] == 2);
        });

        it('average of waveform samples (non noise part) should be simetric', function() {
            let stream2 = new generator.WaveformGenerator(has_noise = false, random_state = 777);
            stream2.prepare_for_use();

            let n = 500;
            samples = stream2.next_sample(n);
            for(let j = 2; j != 11; j++) {
                let sum1 = 0;
                let sum2 = 0;
                for(let i = 0; i < n; i++) {
                    sum1 = sum1 + samples[0][i][j];
                    sum2 = sum2 + samples[0][i][20 - j];
                };
            assert.ok(Math.abs(Math.round(sum1 / n * 10) - Math.round(sum2 / n * 10)) <= 3);
            };
        });

        it('last sample should be the same as next sample called before', function() {
            next_sample = stream.next_sample(2);
            last_sample = stream.last_sample();
            for(let i = 0; i < stream.n_features; i++) {
                assert.equal(next_sample[0][0][i], last_sample[0][0][i]);
                assert.equal(next_sample[0][1][i], last_sample[0][1][i]);
            };
            for(let i = 0; i < 2; i++) {
                assert.equal(next_sample[1][i], last_sample[1][i]);
                assert.equal(next_sample[1][i], last_sample[1][i]);
            };
        });
    });
});
describe('RandomTreeGenerator', function(){
    let stream = new generator.RandomTreeGenerator(tree_random_state=null, sample_random_state=null, n_classes=2,
                                                    n_cat_features=2, n_num_features=5, n_categories_per_cat_feature=5,
                                                    max_tree_depth=6, min_leaf_depth=3, fraction_leaves_per_level=0.1);
    stream.prepare_for_use();

    it('should be -1 remainin samples', function(){
        assert.equal(-1, stream.n_remaining_samples());
    });

    it('test if feature names are correct', function() {
        let expected_names = ['att_num_0', 'att_num_1', 'att_num_2', 'att_num_3', 'att_num_4',
                                'att_nom_0_val0', 'att_nom_0_val1', 'att_nom_0_val2', 'att_nom_0_val3', 'att_nom_0_val4',
                                'att_nom_1_val0', 'att_nom_1_val1', 'att_nom_1_val2', 'att_nom_1_val3', 'att_nom_1_val4'];
        for(let i = 0; i < expected_names.length; i++) {
            assert.equal(expected_names[i], stream.feature_names[i]);
        };
        assert.equal(expected_names.length, stream.feature_names.length);
    });

    it('expected targets should be [0,1]', function() {
        let expected_targets = [0, 1];
        for(let i = 0; i < stream.n_classes; i++) {
            assert.equal(expected_targets[i], stream.target_values[i]);
        };
    });

    it('target_names should be \'class\' ', function() {
        assert.equal('class', stream.target_names[0])
    });

    it('should be 15 fatures', function() {
        assert.equal(15, stream.n_features);
    });

    it('should be 2 categorical features', function() {
        assert.equal(2, stream.n_cat_features);
    });

    it('should be 5 numerical features', function() {
        assert.equal(5, stream.n_num_features);
    });

    it('should be 1 target', function() {
        assert.equal(1, stream.n_targets);
    });

    it('test if data info is correct', function(){
        info = 'Random Tree Generator'
                + '\n1 targets'
                + '\n2 classes'
                + '\n15 features';
        assert.equal(info, stream.get_data_info());
    });

    it('stream should have more samples', function(){
        assert.ok(stream.has_more_samples());
    });

    it('stream should be restartable',function(){
        assert.ok(stream.is_restartable());
    });

    it('feature sample should have lenght 15 and labels should be 0 or 1', function() {
        next_sample = stream.next_sample();
        assert.equal(15, next_sample[0][0].length);
        assert.equal(1, next_sample[1].length);
        assert.ok(next_sample[1] == 0 || next_sample[1] == 1);
    });

    it('all features of sample should have lenght 15 and labels should be 0 or 1', function() {
        next_sample = stream.next_sample(2);
        assert.equal(15, next_sample[0][0].length);
        assert.equal(15, next_sample[0][1].length);
        assert.equal(2, next_sample[1].length);
        assert.ok(next_sample[1][0] == 0 || next_sample[1][0] == 1);
        assert.ok(next_sample[1][1] == 0 || next_sample[1][1] == 1);
    });

    it('last sample should be the same as next sample called before', function() {
        next_sample = stream.next_sample(2);
        last_sample = stream.last_sample();
        for(let i = 0; i < stream.n_features; i++) {
            assert.equal(next_sample[0][0][i], last_sample[0][0][i]);
            assert.equal(next_sample[0][1][i], last_sample[0][1][i]);
        };
        for(let i = 0; i < 2; i++) {
            assert.equal(next_sample[1][i], last_sample[1][i]);
            assert.equal(next_sample[1][i], last_sample[1][i]);
        };
    });

    it('numeric features should have uniform distribution', function() {
        let stream2 = new generator.RandomTreeGenerator(tree_random_state=4242, sample_random_state=77677, n_classes=2,
                                                        n_cat_features=2, n_num_features=5, n_categories_per_cat_feature=5,
                                                        max_tree_depth=6, min_leaf_depth=3, fraction_leaves_per_level=0.1);
        stream2.prepare_for_use();
        let n = 100;
        samples = stream2.next_sample(n);
        let n_sig = 2;
        let sum0 = 0;
        let sum1 = 0;
        let sum2 = 0;
        let sum3 = 0;
        let sum4 = 0;
        for(let i = 0; i < n; i++) {
            sum0 = sum0 + samples[0][i][0];
            sum1 = sum1 + samples[0][i][1];
            sum2 = sum2 + samples[0][i][2];
            sum3 = sum3 + samples[0][i][3];
            sum4 = sum4 + samples[0][i][4];
        };
        assert.ok(Math.abs(sum0 - n / 2) < n_sig * Math.sqrt(n/12));
        assert.ok(Math.abs(sum1 - n / 2) < n_sig * Math.sqrt(n/12));
        assert.ok(Math.abs(sum2 - n / 2) < n_sig * Math.sqrt(n/12));
        assert.ok(Math.abs(sum3 - n / 2) < n_sig * Math.sqrt(n/12));
        assert.ok(Math.abs(sum4 - n / 2) < n_sig * Math.sqrt(n/12));
    });

    it('categorical features should be distributed uniformly', function(){
        let stream2 = new generator.RandomTreeGenerator(tree_random_state=4242, sample_random_state=77677, n_classes=2,
                                                        n_cat_features=2, n_num_features=5, n_categories_per_cat_feature=5,
                                                        max_tree_depth=6, min_leaf_depth=3, fraction_leaves_per_level=0.1);
        stream2.prepare_for_use();
        let n = 100;
        samples = stream2.next_sample(n);
        let n_sig = 2;
        let sum = 0;
        let sum0 = 0;
        let sum1 = 0;
        let sum2 = 0;
        let sum3 = 0;
        let sum4 = 0;
        let k = stream2.n_categories_per_cat_feature;
        for(let i = 0; i < n ; i++){
            sum0 = sum0 + samples[0][i][5];
            sum1 = sum1 + samples[0][i][6];
            sum2 = sum2 + samples[0][i][7];
            sum3 = sum3 + samples[0][i][8];
            sum4 = sum4 + samples[0][i][9];
        };
        sum = sum0 + sum1 + sum2 + sum3 + sum4;

        assert.equal(n, sum);
        assert.ok(Math.abs(sum0 - n / 5) < n_sig * Math.sqrt(n * (k -1) / (k * k)));
        assert.ok(Math.abs(sum1 - n / 5) < n_sig * Math.sqrt(n * (k -1) / (k * k)));
        assert.ok(Math.abs(sum2 - n / 5) < n_sig * Math.sqrt(n * (k -1) / (k * k)));
        assert.ok(Math.abs(sum3 - n / 5) < n_sig * Math.sqrt(n * (k -1) / (k * k)));
        assert.ok(Math.abs(sum4 - n / 5) < n_sig * Math.sqrt(n * (k -1) / (k * k)));
    });
});

describe('DataGenerator', function(){
    let stream = new generator.DataGenerator(n_samples = 1000, has_noise = false, random_state = null, year = 365, day = 6, season = true);
    stream.prepare_for_use();
    it('should be 1000 remaining samples', function(){
        assert.equal(1000, stream.n_remaining_samples())
    })

    it('test if feature names are correct', function(){
        for(let i = 1; i < stream.feature_names.length + 1; i++){
            assert.equal('att_num_' + i, stream.feature_names[i - 1])
        };
    })

    it('should be 16 fatures', function(){
        assert.equal(11, stream.n_features);
    })
    
    it('stream should be restartable', function(){
        assert.ok(stream.is_restartable());
    });

    it('sample should have expected shape', function(){
        let sample = stream.next_sample();
        assert.equal(2, sample.length);
        assert.equal(1, sample[0].length);
        assert.equal(11, sample[0][0].length);
        assert.equal(1, sample[1].length);

        sample = stream.next_sample(batch_size = 3);
        assert.equal(2, sample.length);
        assert.equal(3, sample[0].length);
        assert.equal(11, sample[0][0].length);
        assert.equal(11, sample[0][1].length);
        assert.equal(11, sample[0][2].length);
        assert.equal(3, sample[1].length);
    })
    
    it('restart should start stream again from first sample', function() {
        stream.restart();
        let sample = stream.next_sample();
        stream.restart();
        let sample2 = stream.next_sample();
        for(let i = 0; i < 11; i++){
            assert.equal(sample[0][0][i], sample2[0][0][i]);
        };
        assert.equal(sample[1][0], sample2[1][0]);
    })

})