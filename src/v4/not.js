'use strict';
var identity = require('ramda/src/identity');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var Err = require('../err').Err;

module.exports = function not(validate,ctx){
  var result = validate(ctx);
  return (
    result.isFailure ? Success(identity) 
      : Failure([Err.Single("Condition valid", ctx)]) 
  );

}
