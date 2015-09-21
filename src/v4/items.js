'use strict';
var type = require('ramda/src/type');
var map = require('ramda/src/map');
var curry = require('ramda/src/curry');
var range = require('ramda/src/range');
var compose = require('ramda/src/compose');
var identity = require('ramda/src/identity');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var Err = require('../err').Err;
var context = require('../context');

var validateItemOrAdditional = curry( function(validate,ctx,sch,addsch,i){
  var addschtype = type(addsch);

  if (i in sch) {
    return validate(context.focus(ctx,i));
  } else {
    var addctx = context.focusSiblingSchemaPair(ctx,['additionalItems',i]);
    if (addschtype == 'Boolean'){
      return addsch ? Success(identity)
               : Failure([Err.Single("additional item found",addctx)]);
    } else if (addschtype == 'Object'){
      return validate(addctx);
    }
  }
  
  return Success(identity);
});

module.exports = function items(validate,ctx){
  var cur = context.getCurrent(ctx)
    , schema = cur[0], value = cur[1], t = type(value), schtype = type(schema);

  if (t !== 'Array') return Success(identity);

  if (schtype == 'Array'){
    var addsch = context.getSiblingSchema(ctx,'additionalItems');
    return map(
             validateItemOrAdditional(validate,ctx,schema,addsch),
             range(0, value.length)
           );
  }
  
  if (schtype == 'Object'){
    return map( 
             compose(validate, context.focusValue(ctx)),
             range(0, value.length)
           );
  }

  return Success(identity);
}


