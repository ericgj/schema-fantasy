'use strict';
var type = require('ramda/src/type');
var map = require('ramda/src/map');
var identity = require('ramda/src/identity');
var keysIn = require('ramda/src/keysIn');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context');

module.exports = function properties(validate,ctx){
  var cur = context.getCurrent(ctx)
    , schema = cur[0], value = cur[1], t = type(value);

  if (t !== 'Object') return Success(identity);

  return map(function(p){ return validate(context.focus(ctx,p)); }, 
             keysIn(schema) );
}


