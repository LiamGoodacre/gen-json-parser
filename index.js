var parser = require('./lib/parser');
var config = require('./lib/config');

module.exports = {
  generate: parser.generate,
  config: config,
  parse: {
    Identity: parser.generate(config.Identity),
    JValues: parser.generate(config.JValues)
  }
};
