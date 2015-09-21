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

var validateDependency = curry( function _validateDependency(validate, ctx, p){
  return validate(context.focusSchema( context.focusSchema(ctx,'dependencies'), p));
});

function getError(r){ return r.orElse(identity); }

function missingDep(ctx,key,dep){
  return Failure([ 
    Err.Single('Missing dependency "' + dep + "' given '" + key + "'", ctx) 
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

  for (var key in schema){
    if (!(key in value)) continue;
    var dep = schema[key]
      , deptype = type(dep);
    if ('Array' == deptype){
      for (var i=0;i<dep.length;++i){
        if (!(dep[i] in value)){
          fails = chain( always(missingDep(ctx,key,dep[i])), fails);
        }
      }
    } 
    if ('Object' == deptype){
      var results = map( validateDependency(validate,ctx), keysIn(dep) );
      var failResults = filter(prop('isFailure'), results);
      var failErrs = chain(getError, failResults);
      if (failResults.length > 0){
        fails = chain( always(failedDep(ctx,key,failErrs)), fails);
      }
    }
  }
  
  return fails;
}


