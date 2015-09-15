'use strict';
var always = require('ramda/src/always');
var identity = require('ramda/src/identity');
var Type = require('union-type');
var Validation = require('data.validation')
  , Success = Validation.Success

var Context = require('./context').Context;

var allOf = require('./v4/allOf');
var anyOf = require('./v4/anyOf');
var oneOf = require('./v4/oneOf');
var properties = require('./v4/properties');
var type  = require('./v4/type');

var Predicate = Type({
  allOf: [Function, Context.Cursor],
  anyOf: [Function, Context.Cursor],
  oneOf: [Function, Context.Cursor],
  properties: [Function, Context.Cursor],
  type: [Context.Cursor],
  UNKNOWN: []
});

var evaluate = Predicate.case({
  allOf: allOf, 
  anyOf: anyOf, 
  oneOf: oneOf, 
  properties: properties, 
  type: type,
  _: always(Success(identity))  // ignore unknown schema keys == always return success
});

module.exports = {Predicate: Predicate, evaluate: evaluate}
