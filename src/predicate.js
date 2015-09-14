const always = require('ramda/src/always');
const identity = require('ramda/src/identity');
const Type = require('union-type');
const Validation = require('data.validation')
    , Success = Validation.Success

const Context = require('./context').Context;

const allOf = require('./v4/allOf');
const anyOf = require('./v4/anyOf');
const oneOf = require('./v4/oneOf');
const properties = require('./v4/properties');
const type  = require('./v4/type');

const Predicate = Type({
  allOf: [Function, Context.Cursor],
  anyOf: [Function, Context.Cursor],
  oneOf: [Function, Context.Cursor],
  properties: [Function, Context.Cursor],
  type: [Context.Cursor],
  UNKNOWN: []
});

const evaluate = Predicate.case({
  allOf, anyOf, oneOf, properties, type,
  _: always(Success(identity))  // ignore unknown schema keys == always return success
});

module.exports = {Predicate, evaluate}
