'use strict';
var identity = require('ramda/src/identity');
var chain = require('ramda/src/chain');
var filter = require('ramda/src/filter');
var map = require('ramda/src/map');
var prop = require('ramda/src/prop');

var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context');
var Err = require('../err').Err;
function getError(v){ return v.orElse(identity); }

module.exports = function allOf(validate,ctx){
  var listOfSchemas = context.getCurrent(ctx)[0];
  var results = listOfSchemas.map( function(schema,i){
                  return validate(context.focusSchema(ctx,i)) ;
                });
  var failResults = filter(prop('isFailure'), results);
  var failErrs = chain(getError, failResults);

  return (
    failResults.length === 0 ? Success(identity)
      : Failure([Err.Compound("Not all conditions valid", ctx, failErrs)])
  );
}

