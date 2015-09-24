'use strict';
var map = require('ramda/src/map');
var identity = require('ramda/src/identity');
var equals = require('ramda/src/equals');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context');
var Err = require('../err').Err;
var humanList = require('../humanlist');

module.exports = function _enum(ctx){
  var current = context.getCurrent(ctx) 
    , expected = current[0], value = current[1];
 
  // not sure about this... it's to cover a very unusual case, not representable
  // in JSON in fact. It's _not_ needed for property enum schemas where the
  // property doesn't exist in the value -- it's _only_ needed when the value
  // itself is undefined.
  if (value === undefined) return Success(identity); 
  
  var found = false;
  for (var i=0;i<expected.length;++i){
    if (equals(expected[i],value)){
      found = true; break;
    }
  }

  var strExpected = map(JSON.stringify,expected);
  var strActual = JSON.stringify(value === undefined ? null : value);

  return found ? Success(identity)
    : Failure([Err.Values("", ctx, humanList('or',strExpected), strActual)]);
}

