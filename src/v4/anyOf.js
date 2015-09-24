'use strict';
var identity = require('ramda/src/identity');
var filter = require('ramda/src/filter');
var chain = require('ramda/src/chain');
var prop = require('ramda/src/prop');

var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context');
var Err = require('../err').Err;
function getError(v){ return v.orElse(identity); }

module.exports = function anyOf(validate,ctx){
  var listOfSchemas = context.getCurrent(ctx)[0];
  var results = listOfSchemas.map( function(schema,i){
                  return validate(context.focusSchema(ctx,i)) ;
                });
  
  var failResults = filter(prop('isFailure'),results);
  var failErrs = chain(getError, failResults);

  return (  
    (results.length === 0 || (failResults.length < results.length)) ? Success(identity)
      : Failure([Err.Compound("No conditions valid", ctx, failErrs)])
  );
}

