'use strict';
var always = require('ramda/src/always');
var identity = require('ramda/src/identity');
var Type = require('union-type');
var Validation = require('data.validation')
  , Success = Validation.Success

var Context = require('./context').Context;

var additionalProperties = require('./v4/additionalProperties');
var allOf = require('./v4/allOf');
var anyOf = require('./v4/anyOf');
var dependencies = require('./v4/dependencies');
var _enum = require('./v4/enum');
var items = require('./v4/items');
var maximum = require('./v4/maximum');
var maxItems = require('./v4/maxItems');
var maxLength = require('./v4/maxLength');
var maxProperties = require('./v4/maxProperties');
var minimum = require('./v4/minimum');
var minItems = require('./v4/minItems');
var minLength = require('./v4/minLength');
var minProperties = require('./v4/minProperties');
var multipleOf = require('./v4/multipleOf');
var not = require('./v4/not');
var oneOf = require('./v4/oneOf');
var pattern = require('./v4/pattern');
var patternProperties = require('./v4/patternProperties');
var properties = require('./v4/properties');
var required = require('./v4/required');
var type  = require('./v4/type');
var uniqueItems  = require('./v4/uniqueItems');

var Predicate = Type({
  additionalProperties: [Function, Context.Cursor],
  allOf:                [Function, Context.Cursor],
  anyOf:                [Function, Context.Cursor],
  dependencies:         [Function, Context.Cursor],
  enum:                 [Context.Cursor],
  items:                [Function, Context.Cursor],
  maximum:              [Context.Cursor],
  maxItems:             [Context.Cursor],
  maxLength:            [Context.Cursor],
  maxProperties:        [Context.Cursor],
  minimum:              [Context.Cursor],
  minItems:             [Context.Cursor],
  minLength:            [Context.Cursor],
  minProperties:        [Context.Cursor],
  multipleOf:           [Context.Cursor],
  not:                  [Function, Context.Cursor],
  oneOf:                [Function, Context.Cursor],
  pattern:              [Context.Cursor],
  patternProperties:    [Function, Context.Cursor],
  properties:           [Function, Context.Cursor],
  required:             [Context.Cursor],
  type:                 [Context.Cursor],
  uniqueItems:          [Context.Cursor],
  UNKNOWN: []
});

var evaluate = Predicate.case({
  additionalProperties: additionalProperties,
  allOf: allOf, 
  anyOf: anyOf, 
  dependencies: dependencies,
  enum: _enum,
  items: items,
  maximum: maximum,
  maxItems: maxItems,
  maxLength: maxLength,
  maxProperties: maxProperties,
  minimum: minimum,
  minItems: minItems,
  minLength: minLength,
  minProperties: minProperties,
  multipleOf: multipleOf,
  not: not,
  oneOf: oneOf, 
  pattern: pattern, 
  patternProperties: patternProperties, 
  properties: properties, 
  required: required,
  type: type,
  uniqueItems: uniqueItems,
  _: always(Success(identity))  // ignore unknown schema keys == always return success
});

module.exports = {Predicate: Predicate, evaluate: evaluate}
