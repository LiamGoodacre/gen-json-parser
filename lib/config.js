var config = {};
module.exports = config;

var util = require('./util');

config.Identity = {
  null: util.identity,
  boolean: util.identity,
  number: util.identity,
  string: util.identity,
  array: util.identity,
  object: util.identity
};


var JValue = function (tag) {
  return function (term) {
    return { tag: tag, term: term };
  };
};

config.JValues = {
  null:    JValue('null'),
  boolean: JValue('boolean'),
  number:  JValue('number'),
  string:  JValue('string'),
  array:   JValue('array'),
  object:  JValue('object')
};

