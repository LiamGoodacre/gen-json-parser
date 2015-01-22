# gen-json-parser
Generate JSON parsers for custom data structures.

~~~
var json = require('gen-json-parser');
var id = function (v) { return v; };

// replica of JSON.parse
var js = json.generate({
  null: id,
  boolean: id,
  string: id,
  number: id,
  array: id,
  object: function (pairs) {
    return pairs.reduce(function (acc, pair) {
      acc[pair[0]] = pair[1];
      return acc;
    }, {});
  }
});
~~~

Better documentation to come.

