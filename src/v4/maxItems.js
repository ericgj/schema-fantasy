'use strict';
var identity = require('ramda/src/identity');
var type = require('ramda/src/type');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context');
var Err = require('../err').Err;

module.exports = function maxItems(ctx){
  var cur = context.getCurrent(ctx)
    , schema = cur[0], value = cur[1], t = type(value)
  
  if (t !== 'Array') return Success(identity);

  return (
    (value.length <= schema) ? Success(identity)
      : Failure([Err.Single("more than " + schema + " items", ctx)])
  );
}



