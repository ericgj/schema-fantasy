'use strict';
var identity = require('ramda/src/identity');
var type = require('ramda/src/type');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var ulength = require('../ulength');
var context = require('../context');
var Err = require('../err').Err;

module.exports = function maxLength(ctx){
  var cur = context.getCurrent(ctx)
    , schema = cur[0], value = cur[1], t = type(value)
  
  if (t !== 'String') return Success(identity);

  var len = value.length;
  if (value.normalize){ // if ES6-compatible string
    value = value.normalize();
    len = ulength(value);
  }

  return (
    (len <= schema) ? Success(identity)
      : Failure([Err.Single("longer than " + schema + " characters", ctx)])
  );
}




