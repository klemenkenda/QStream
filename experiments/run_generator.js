//script used in jupiter notebook to run generators.
generator = require('../index.js')
fs = require('fs')

let num_of_samples = 3000;

let stream = new generator.Data.WaveformGenerator();
//let stream = new generator.Data.RandomTreeGenerator();
//let stream = new generator.Data.DataGenerator();

stream.prepare_for_use();
stream.next_sample(num_of_samples);


fs.writeFileSync( 'x.txt', JSON.stringify(stream.current_sample_x))
fs.writeFileSync( 'y.txt', JSON.stringify(stream.current_sample_y))
//fs.writeFileSync( './data/Generators_examples/x.txt', JSON.stringify(stream.current_sample_x))
//fs.writeFileSync( './data/Generators_examples/x.txt', JSON.stringify(stream.current_sample_y))