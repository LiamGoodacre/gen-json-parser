var util = {};
module.exports = util;

util.getTag = function (val) {
  return ({}).toString.call(val).slice(8, -1).toLowerCase();
};

util.assertTag = function (tag, val) {
  assert.equals(util.getTag(val), tag);
};

var unsafeCombine = function (out, other) {
  Object.keys(other).forEach(function (key) {
    out[key] = other[key];
  });
  return out;
};

util.merge = function (cfgs) {
  cfgs.reduce(unsafeCombine, {});
};

util.identity = function (v) {
  return v;
};

