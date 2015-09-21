'use strict';
var identity = require('ramda/src/identity');
var type = require('ramda/src/type');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context');
var Err = require('../err').Err;

module.exports = function multipleOf(ctx){
  var cur = context.getCurrent(ctx)
    , schema = cur[0], value = cur[1], t = type(value)
  if (t !== 'Number') {
    return Failure([Err.Type('Number',t)]);
  }
  return (
    (((value/schema) % 1) === 0) ? Success(identity)
      : Failure([Err.Single("not a multiple of " + schema, ctx)])
  );
}
