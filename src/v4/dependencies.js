'use strict';
var identity = require('ramda/src/identity');
var curry = require('ramda/src/curry');
var chain = require('ramda/src/chain');
var always = require('ramda/src/always');
var map = require('ramda/src/map');
var keysIn = require('ramda/src/keysIn');
var filter = require('ramda/src/filter');
var prop = require('ramda/src/prop');
var type = require('ramda/src/type');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context');
var Err = require('../err').Err;

function getError(r){ return r.orElse(identity); }

var validatePresence = curry( function _validatePresence(ctx,value,key,dep){
  return (dep in value) ? Success(identity)
    : Failure([
        Err.Single('Missing "' + dep + '" given "' + key + '"', ctx) 
      ]);
});

var validateDependency = curry( function _validateDependency(validate, ctx, p){
  return validate(context.focusSchema(ctx, p));
});



function missingDep(ctx,key,errs){
  return Failure([ 
    Err.Compound('Missing dependenc' + (errs.length === 1 ? "y " : "ies ") + 
                 'for "' + key + '"', ctx, errs) 
  ]);
}

function failedDep(ctx,key,errs){
  return Failure([ 
    Err.Compound('Failed dependency for "' + key + '"', ctx, errs)
  ]);
}

module.exports = function dependencies(validate,ctx){
  var cur = context.getCurrent(ctx)
    , schema = cur[0], value = cur[1], t = type(value)
  var fails = Success(identity);

  if (t !== 'Object') return Success(identity); 

  return map( function(key){
      if (!(key in value)) return Success(identity);
      var dep = schema[key]
        , deptype = type(dep);
      if ('Array' == deptype){
        var results = map( validatePresence(ctx,value,key) , dep);
        var failResults = filter(prop('isFailure'), results);
        var failErrs = chain(getError, failResults);
        return (failResults.length === 0) ? Success(identity)
          : missingDep(ctx,key,failErrs) ;
      } 
      if ('Object' == deptype){
        var result = validateDependency(validate,ctx,key);
        return (result.isSuccess) ? Success(identity)
          : failedDep(ctx,key, chain(getError, [result]));
      }
    },
    keysIn(schema)
  );
}


