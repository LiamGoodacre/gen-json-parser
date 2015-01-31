# gen-json-parser
Generate JSON parsers for custom data structures.


## Parser Results

Parse results are objects with a boolean `status` property.
If parsing succeeds, the status is `true` and there is a `value` property associated with the parsed value.
Otherwise the status is `false` with some information about the parse error.


## Premade parsers

Setup:

~~~javascript
var parse = require('gen-json-parser').parse;
var demo = '{ "foo": "bar", "key": [ 2, true, [ null ] ] }';
~~~


### Identity

The identity parser translates JSON values to their JavaScript equivalents, except JSON objects are parsed into JavaScript arrays of pairs.

Example:

~~~javascript
parse.Identity(demo);
> {
>   "status": true,
>   "value": [
>     [ "foo", "bar" ],
>     [ "key", [
>       2,
>       true,
>       [ null ]
>     ] ]
>   ]
> }
~~~


### JValues

A JValue is a JavaScript object with two properties: `tag` and `term`.

`tag` is associated with a string value indicating a 'type', such as `"boolean"`, `"null"`, or `"object"`.

`term` is associated with a value that has the type indicated by the `tag` string.

The JValues parser produces a JavaScript JValue.  For example, the JSON `"true"` would map to the JavaScript value `{ "tag": "boolean", "term": true }`.

Example:

~~~javascript
parse.JValues(demo);
> {
>   "status": true,
>   "value": {
>     "tag": "object",
>     "term": [
>       [ "foo", { "tag": "string", "term": "bar" } ],
>       [ "key", {
>         "tag": "array",
>         "term": [
>           { "tag": "number", "term": 2 },
>           { "tag": "boolean", "term": true },
>           { "tag": "array", "term": [
>             { "tag": "null", "term": null }
>           ] }
>         ]
>       } ]
>     ]
>   }
> }

~~~


## Custom parsers

To write a custom JSON parser, you must provide details of how to interpret each of the different JSON value types: `null`, `boolean`, `string`,  `number`, `array`, `object`.

For example, to replicate the behaviour of `JSON.parse`, we could generate the following parser:

~~~javascript
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

