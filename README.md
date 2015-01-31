# gen-json-parser
Generate JSON parsers for custom data structures.


## Motivation

This project came about after realizing that JavaScript objects **are not** Maps.  With a Map data-structure one should expect that for all keys `k`, adding a new entry at `k` cannot affect the existence of other entries.  JavaScript objects do not have this property do to special keys such as `"__proto__"`.

If you wish to treat JSON as a representation of data (for example, that a user may input) then you will want to avoid `JSON.parse`.  What you want is to parse the JSON into data-structures that are appropriate to your solution.


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

To write a custom JSON parser, you must provide details of how to interpret each of the different JSON value types: `null`, `boolean`, `string`,  `number`, `array`, `object`.  If you do not provide an interpreter for a given type, then it will be a parse error for values of that type to appear in the JSON.

For example, to replicate the behaviour of `JSON.parse`, we could generate the following parser:

~~~javascript
var generate = require('gen-json-parser').generate;
var id = function (v) { return v; };

var parseJSON = generate({
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

Note that `JSON.parse` throws if there is a parse error, whereas this one will return an object with a `status` property associated with `false`.

