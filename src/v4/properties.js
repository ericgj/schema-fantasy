'use strict';
var map = require('ramda/src/map');
var keysIn = require('ramda/src/keysIn');

var context = require('../context');

module.exports = function properties(validate,ctx){
  var propSchemas = context.getCurrent(ctx)[0];
  return map(function(p){ return validate(context.focus(ctx,p)); }, 
             keysIn(propSchemas) );
}


