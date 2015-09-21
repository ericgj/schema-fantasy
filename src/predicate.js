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
var not = require('./v4/not');
var oneOf = require('./v4/oneOf');
var patternProperties = require('./v4/patternProperties');
var properties = require('./v4/properties');
var required = require('./v4/required');
var type  = require('./v4/type');

var Predicate = Type({
  additionalProperties: [Function, Context.Cursor],
  allOf:                [Function, Context.Cursor],
  anyOf:                [Function, Context.Cursor],
  dependencies:         [Function, Context.Cursor],
  enum:                 [Context.Cursor],
  items:                [Function, Context.Cursor],
  not:                  [Function, Context.Cursor],
  oneOf:                [Function, Context.Cursor],
  patternProperties:    [Function, Context.Cursor],
  properties:           [Function, Context.Cursor],
  required:             [Context.Cursor],
  type:                 [Context.Cursor],
  UNKNOWN: []
});

var evaluate = Predicate.case({
  additionalProperties: additionalProperties,
  allOf: allOf, 
  anyOf: anyOf, 
  dependencies: dependencies,
  enum: _enum,
  items: items,
  not: not,
  oneOf: oneOf, 
  patternProperties: patternProperties, 
  properties: properties, 
  required: required,
  type: type,
  _: always(Success(identity))  // ignore unknown schema keys == always return success
});

module.exports = {Predicate: Predicate, evaluate: evaluate}
