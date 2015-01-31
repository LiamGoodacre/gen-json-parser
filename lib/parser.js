var P = require('parsimmon');

//: (Parser a, Parser b) -> Parser (Array b)
var sepBy = function (interval, parser) {
  return parser.chain(function (hd) {
    return interval.then(parser).many().map(function (tl) {
      return [hd].concat(tl);
    });
  });
};

//: Parser a -> Parser a
var spaced = function (parser) { return parser.skip(P.optWhitespace); };

//: String -> Parser String
var lit = function (str) { return spaced(P.string(str)); };

//: Array String -> Parser String
var lits = function (xs) { return P.seq.apply(P, xs.map(lit)); };

//: (String, a) -> Parser a
var token = function (s, v) { return lit(s).result(v); };

//: (String, String) -> Parser a -> Parser a
var surround = function (open, close, p) {
  return lit(open).then(p).skip(lit(close));
};

//: Array (RegExp, String)
var stringProcesses = [
  [/\\(\\|")/g, '$1'],
  [/\\n/g, '\n'],
  [/\\r/g, '\r'],
  [/\\t/g, '\t'],
  [/\\v/g, '\v'],
  [/\\f/g, '\f'],
  [/\\b/g, '\b']
];

//: Parser String
var string = P.regex(/^(?:"(?:\\[\\"bfnrt/]|\\u[a-fA-F0-9]{4}|[^\\\0-\x09\x0a-\x1f"])*")/)

//: Parser String
var lit_str = spaced(string).map(function (text) {
  return stringProcesses.reduce(function (a, p) {
    return a.replace(p[0], p[1]);
  }, text.slice(1, -1));
});

//: Parser Number
var lit_num = spaced(P.regex(/^(?:(-?(\d|[1-9]\d+))(\.\d+)?([eE][-+]?\d+)?\b)/)).map(Number);

//: Parser (Array a)
var pureNilArray = P.succeed(null).map(function (_0) {
  // generate a new array each time
  return [];
});

var use = function (make) {
  return function (key, p) {
    var wrap = make[key];
    return (!wrap ? P.fail() : p.map(wrap)).desc(key);
  };
};

var generate = function (make) {
  var using = use(make);

  var json_null   = using('null',    token('null', null));
  var json_true   = using('boolean', token('true', true));
  var json_false  = using('boolean', token('false', false));
  var json_string = using('string',  lit_str);
  var json_number = using('number',  lit_num);

  // NOTE: parseArray and json_member lazily refer to json_value which is declared afterwards

  var json_array = using('array', P.lazy(function () {
    return surround('[', ']',
      sepBy(lit(','), json_value).or(pureNilArray)
    )
  }));

  //  object entry (key & value)
  var json_member = lit_str.skip(lit(':')).chain(function (key) {
    return json_value.map(function (value) {
      return [key, value];
    });
  });

  var json_object = using('object',
    surround('{', '}',
      sepBy(lit(','), json_member).or(pureNilArray)
    )
  );

  var json_value = P.alt(
    json_null,
    json_true,
    json_false,
    json_string,
    json_number,
    json_array,
    json_object
  ).desc('json');

  var json_text = P.optWhitespace.then(json_value).skip(P.eof);

  return function (json) {
    try {
      return json_text.parse(json);
    }
    catch (err) {
      return { status: false, error: err };
    }
  };
};

exports.generate = generate;
