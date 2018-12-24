const Utils =  require('../utils/utils.js')
const assert = require('assert')

describe('Utils', function(){
    describe('random()', function(){
        it('pseudo random should be in  interval [0,1)', function () {
            let random = new Utils.Random(12345);
            for (let i = 0; i < 10000; i++){
                let float = random.random(true);
                assert.ok(float < 1 && float >= 0);
            }
        })
        it('random should be in  interval [0,1)', function () {
            let random = new Utils.Random();
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
})