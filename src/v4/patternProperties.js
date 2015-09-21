/* globals RegExp: true */
'use strict';
var type = require('ramda/src/type');
var identity = require('ramda/src/identity');
var xprod = require('ramda/src/xprod');
var keysIn = require('ramda/src/keysIn');
var map = require('ramda/src/map');
var compose = require('ramda/src/compose');
var filter = require('ramda/src/filter');
var apply = require('ramda/src/apply');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context');

function matchesProp(rx, prop){
  var matcher = new RegExp(rx);
  return matcher.test(prop);
}

module.exports = function(validate,ctx){
  var cur = context.getCurrent(ctx)
    , schema = cur[0], value = cur[1], t = type(value);

  if (t !== 'Object') return Success(identity);

  // per sec. 8.3.2
  if (undefined === schema) schema = {};

  var pairs = xprod(keysIn(schema), keysIn(value));

  return map(compose( validate, context.focusPair(ctx) ), 
             filter( apply(matchesProp), pairs )
         );
}


