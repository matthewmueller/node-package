var Package = require('./');

Package('matthewmueller/cheerio@0.10.0')
  .dir(__dirname)
  .install(function(err) {
    if (err) throw err;
    console.log('all installed!');
  });
