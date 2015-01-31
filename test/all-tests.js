var fs = require("fs");
var assert = require("assert");
var parser = require("../index");
var parse = parser.parse.JValues;

//  construct a result value
var VAL = function (tag) {
  return function (term) {
    return { tag: tag, term: term };
  };
};

//  result value constructors
var NUL = VAL('null')(null);
var BLN = VAL('boolean');
var NUM = VAL('number');
var STR = VAL('string');
var OBJ = VAL('object');
var ARR = VAL('array');


//  test that json is correctly parsed into `out`
var CHECK = function (json, out) {
  return function () {
    var res = parse(json);
    assert.deepEqual(res.value, out);
    assert(res.status, "should succeed parsing" + JSON.stringify(res));
  };
};

var FAIL = function (json) {
  return function () {
    assert(!parse(json).status, "should fail parsing");
  };
};

var PASS = function (json) {
  return function () {
    var result = parse(json)
    assert(result.status, "should pass" + JSON.stringify(result));
  };
};

var FILE = function (path) {
  return fs.readFileSync(__dirname + path).toString();
};

////////////////////////////////////////////////////////////////////////////////

exports["test object"] = CHECK('{"foo": "bar"}', OBJ([ ["foo", STR("bar")] ]));

exports["test escaped backslash"] = CHECK('{"foo": "\\\\"}', OBJ([ ["foo", STR("\\")] ]));

exports["test escaped chars"] = CHECK('{"foo": "\\\\\\\""}', OBJ([ ["foo", STR('\\\"')] ]));

exports["test escaped \\n"] = CHECK('{"foo": "\\\\\\n"}', OBJ([ ["foo", STR('\\\n')] ]));

exports["test string with escaped line break"] = function () {
  var json = '{"foo": "bar\\nbar"}';
  var out = parse(json);
  assert.deepEqual(out.value,
      OBJ([ ["foo", STR("bar\nbar")] ]));
  var converted = out.value.term.reduce(function (a, p) {
    a[p[0]] = p[1].term;
    return a;
  }, {});
  assert.equal(JSON.stringify(converted).length, 18);
};

exports["test string with line break"] = FAIL('{"foo": "bar\nbar"}');

exports["test string literal"] = CHECK('"foo"', STR("foo"));

exports["test number literal"] = CHECK('1234', NUM(1234));

exports["test null literal"] = CHECK('null', NUL);

exports["test boolean literal"] = CHECK('true', BLN(true));

exports["test unclosed array"] = FAIL(FILE("/fails/2.json"));

exports["test unquotedkey keys must be quoted"] = FAIL(FILE("/fails/3.json"));

exports["test extra comma"] = FAIL(FILE("/fails/4.json"));

exports["test double extra comma"] = FAIL(FILE("/fails/5.json"));

exports["test missing value"] = FAIL(FILE("/fails/6.json"));

exports["test comma after the close"] = FAIL(FILE("/fails/7.json"));

exports["test extra close"] = FAIL(FILE("/fails/8.json"));

exports["test extra comma after value"] = FAIL(FILE("/fails/9.json"));

exports["test extra value after close with misplaced quotes"] = FAIL(FILE("/fails/10.json"));

exports["test illegal expression addition"] = FAIL(FILE("/fails/11.json"));

exports["test illegal invocation of alert"] = FAIL(FILE("/fails/12.json"));

exports["test numbers cannot have leading zeroes"] = FAIL(FILE("/fails/13.json"));

exports["test numbers cannot be hex"] = FAIL(FILE("/fails/14.json"));

exports["test illegal backslash escape \\0"] = FAIL(FILE("/fails/15.json"));

exports["test unquoted text"] = FAIL(FILE("/fails/16.json"));

exports["test illegal backslash escape \\x"] = FAIL(FILE("/fails/17.json"));

exports["test missing colon"] = FAIL(FILE("/fails/19.json"));

exports["test double colon"] = FAIL(FILE("/fails/20.json"));

exports["test comma instead of colon"] = FAIL(FILE("/fails/21.json"));

exports["test colon instead of comma"] = FAIL(FILE("/fails/22.json"));

exports["test bad raw value"] = FAIL(FILE("/fails/23.json"));

exports["test single quotes"] = FAIL(FILE("/fails/24.json"));

exports["test tab character in string"] = FAIL(FILE("/fails/25.json"));

exports["test tab character in string 2"] = FAIL(FILE("/fails/26.json"));

exports["test line break in string"] = FAIL(FILE("/fails/27.json"));

exports["test line break in string in array"] = FAIL(FILE("/fails/28.json"));

exports["test 0e"] = FAIL(FILE("/fails/29.json"));

exports["test 0e+"] = FAIL(FILE("/fails/30.json"));

exports["test 0e+ 1"] = FAIL(FILE("/fails/31.json"));

exports["test comma instead of closing brace"] = FAIL(FILE("/fails/32.json"));

exports["test bracket mismatch"] = FAIL(FILE("/fails/33.json"));

exports["test extra brace"] = FAIL(FILE("/fails/34.json"));

exports["test pass-1"] = PASS(FILE("/passes/1.json"));

exports["test pass-2"] = PASS(FILE("/passes/2.json"));

exports["test pass-3"] = PASS(FILE("/passes/3.json"));

if (require.main === module)
  require("test").run(exports);
