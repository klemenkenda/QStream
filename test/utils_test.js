const Utils =  require('../utils/index.js')
const assert = require('assert')

describe('Utils', function(){
    describe('random.js', function() {
        describe('random()', function(){
            it('pseudo random should be in  interval [0,1)', function () {
                let random = new Utils.Random(12345);
                for (let i = 0; i < 10000; i++){
                    let float = random.random(true);
                    assert.ok(float < 1 && float >= 0);
                }
            })
            it('random should be in  interval [0,1)', function () {
                let random = new Utils.Random(123654);
                for (let i = 0; i < 1000; i++){
                    let float = random.random();
                    assert.ok(float < 1 && float >= 0);
                }
            });
            it('chi squared test for uniform distribution', function(){
                let random = new Utils.Random(12345);
                let n = 1000;
                let k = 5;
                let ni = [];
                for (let i = 0; i < k; i++){
                    ni.push(0);
                }
                for (let i = 0; i < n; i++){
                    rand = random.random(true);
                    if (rand >= 0 && rand < 0.2) {ni[0]++;}
                    else if (rand >= 0.2 && rand < 0.4) {ni[1]++;}
                    else if (rand >= 0.4 && rand < 0.6) {ni[2]++;}
                    else if (rand >= 0.6 && rand < 0.8) {ni[3]++;}
                    else if (rand >= 0.8 && rand < 1.0) {ni[4]++;}
                }

                let chi_sq = 0;
                for (let j = 0; j < k; j++){
                    chi_sq = chi_sq + (n / k - ni[j]) * (n / k - ni[j]) / ni[j];
                }
                assert.ok(chi_sq < 11); // for k = 5 and  P = 0,05%
            });
            
        });
        describe('random_int()', function(){
            it('number should be integer', function () {
                let random = new Utils.Random(54321);
                for (let i = 0; i < 1000; i++){
                    let int = random.random_int(true,0,1000);
                    assert.ok(Math.floor(int) == int);
                }
            });

            it('chi squared test for uniform distribution', function(){
                let random = new Utils.Random(123123);
                let n = 1000;
                let k = 5;
                let ni = [];
                for (let i = 0; i < k; i++){
                    ni.push(0);
                }
                for (let i = 0; i < n; i++){
                    rand = random.random_int(true,0,5);
                    if (rand == 0) {ni[0]++;}
                    else if (rand == 1) {ni[1]++;}
                    else if (rand == 2) {ni[2]++;}
                    else if (rand == 3) {ni[3]++;}
                    else if (rand == 4) {ni[4]++;}   
                }
                let chi_sq = 0;
                for (let j = 0; j < k; j++){
                    chi_sq = chi_sq + (n / k - ni[j]) * (n / k - ni[j]) / ni[j];
                }
                assert.ok(chi_sq < 11); // for k = 5 and  P = 0,05%
            });
        
        });
        describe('random_gauss()', function(){
            it('chi squared test for gaussian distribution', function(){
                let random = new Utils.Random(123456);
                let n = 10000;
                let k = 6;
                let ni = [];
                for (let i = 0; i < k; i++){
                    ni.push(0);
                }
                for (let i = 0; i < n; i++){
                    rand = random.random_gauss(true);
                    if (rand < -1) {ni[0]++;}
                    else if (rand >= -1.0 && rand < -0.5) {ni[1]++;}
                    else if (rand >= -0.5 && rand < 0) {ni[2]++;}
                    else if (rand >= 0 && rand < 0.5) {ni[3]++;}
                    else if (rand >= 0.5 && rand < 1.0) {ni[4]++;}
                    else if (rand >= 1.0) {ni[5]++;} 
                }
                gauss = [0.159, 0.150, 0.192, 0.192, 0.150, 0.159]
                let chi_sq = 0;
                for (let j = 0; j < k; j++){
                    chi_sq = chi_sq + (n * gauss[j] - ni[j]) * (n * gauss[j] - ni[j]) / ni[j];
                }
                assert.ok(chi_sq < 12.5); // for k = 6 and  P = 0,05%
            });
        });
    });

    describe('average.js', function() {
        describe('next_average()', function(){
            it('should calculate averages', function() {
                let ave = new Utils.Average(3);
                let next = ave.next_average(1);
                assert.equal(1/3, next);
                next = ave.next_average(1);
                assert.equal(2/3, next);
                next = ave.next_average(1);
                assert.equal(1, next);
                next = ave.next_average(4);
                assert.equal(2, next);
            });
        });
    });

    describe('utils_bayes.js', function() {
        describe('sum()', function() {
            it('sum of [1,2,3,4] should be 10.', function() {
                let sum = Utils.Bayes;
                assert.equal(10, sum.sum([1,2,3,4]))
            });            
        });

        describe('unique()', function() {
            it('unique([1,1,1,1,1]) should return array with one element 1.', function() {
                let un = Utils.Bayes;
                let unique = un.unique([1,1,1,1,1]);
                assert.equal(1, unique[0]);
                assert.equal(1, unique.length);
            });

            it('unique([1,1,1,2,2,3]) should return array with three elements 1,2 and 3.', function() {
                let un = Utils.Bayes;
                let unique = un.unique([1,1,1,2,2,3]);
                assert.equal(1, unique[0]);
                assert.equal(2, unique[1]);
                assert.equal(3, unique[2]);
                assert.equal(3, unique.length);
            });
        });

        describe('label_binarize()', function() {
            it('should return birized arrays', function() {
                let lb = Utils.Bayes;
                let binarize = lb.label_binarize([1,2,1], [1,2]);
                assert.equal(1, binarize[0][0]);
                assert.equal(0, binarize[0][1]);
                assert.equal(0, binarize[1][0]);
                assert.equal(1, binarize[1][1]);
                assert.equal(1, binarize[2][0]);
                assert.equal(0, binarize[2][1]);
            });
        });

        describe('dot()', function(){
            it('multyplication of [[1, 0], [0, 1]] with [[1, 2], [3, 4]], should return [[1, 2], [3, 4]]', function() {
                let d = Utils.Bayes;
                let dot = d.dot([[1, 0], [0, 1]], [[1, 2], [3, 4]]);
                assert.equal(1, dot[0][0]);
                assert.equal(2, dot[0][1]);
                assert.equal(3, dot[1][0]);
                assert.equal(4, dot[1][1]);
            });
        });

        describe('transpose()', function() {
            it('transpose of [[1, 2], [3, 4]], should return [[1, 3], [2, 4]]', function() {
                let tr = Utils.Bayes;
                let transpose = tr.transpose([[1, 2], [3, 4]]);
                assert.equal(1, transpose[0][0]);
                assert.equal(2, transpose[1][0]);
                assert.equal(3, transpose[0][1]);
                assert.equal(4, transpose[1][1]);
            });
        });

        describe('logsumexp()', function() {
            it('logsumexp([1]), should return 1', function() {
                let lse = Utils.Bayes;
                let logsumexp = lse.logsumexp([1]);
                assert.equal(1, logsumexp);
            });
        });

        describe('mean()', function() {
            it('mean of [1, 2, 3], should return 2', function() {
                let m = Utils.Bayes;
                let mean = m.mean([1, 2, 3]);
                assert.equal(2, mean);
            });
        });

        describe('variance()', function() {
            it('variance of [1, 2, 3], should be 2/3', function() {
                let v = Utils.Bayes;
                let variance = v.variance([1, 2, 3]);
                assert.equal(2/3, variance);
            });
        });
    });
});