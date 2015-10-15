'use strict';
var type = require('ramda/src/type');
var map = require('ramda/src/map');
var apply = require('ramda/src/apply');
var compose = require('ramda/src/compose');
var commute = require('ramda/src/commute');
var identity = require('ramda/src/identity');
var curry = require('ramda/src/curry');
var partial = require('ramda/src/partial');
var keysIn = require('ramda/src/keysIn');
var hasIn = require('ramda/src/hasIn');
var flip = require('ramda/src/flip');
var of = require('ramda/src/of');
var filter = require('ramda/src/filter');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context')
  , Path = context.Path;

/* old
var validateProperty = curry( function _validateProperty(validate,ctx,obj,p){
  return (p in obj) ? validate(context.focus(ctx,p))
                    : Success(identity);
});
*/

module.exports = function(validate,ctx){
  return (
    ctx.fold(
      compose(Failure, of),
      partial(properties, validate)
    )
  );
}

function properties(validate,ctx){

  return context.getCurrent(ctx).fold(
    compose(Failure, of),
    apply(_properties)
  );

  function _properties(schema, value){
    var t = type(value);

    if (t !== 'Object') return Success(identity);

    var ctxs = context.subcontexts(
                 ctx,
                 map( function(p){ return [Path.Child(p), Path.Child(p)]; }, 
                      filter(flip(hasIn)(value), keysIn(schema))
                 )
               );

    return ctxs.fold(
      compose(Failure, of),
      compose(commute(Validation.Success), map(validate))
    );
  }
}


