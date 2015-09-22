'use strict';
var identity = require('ramda/src/identity');
var type = require('ramda/src/type');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context');
var Err = require('../err').Err;

module.exports = function minimum(ctx){
  var cur = context.getCurrent(ctx)
    , schema = cur[0], value = cur[1], t = type(value)
  
  if (t !== 'Number') return Success(identity);
  
  var excl = context.getSiblingSchema(ctx,'exclusiveMinimum')
    , excltype = type(excl);

  if (excltype !== 'Boolean') excl = false;

  return (
    (excl ? value > schema : value >= schema) ? Success(identity)
      : Failure([
          Err.Single("less than " + (excl ? "or equal to " : "") + schema, ctx)
        ])
  );
}




