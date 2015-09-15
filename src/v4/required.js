'use strict';
var map = require('ramda/src/map');
var identity = require('ramda/src/identity');
var type = require('ramda/src/type');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context');
var Err = require('../err').Err;

function typeOf(x){ return _type(x).toLowerCase(); }
function isInteger(x){ return typeOf(x) == 'number' && x === (x|0); }

module.exports = function required(ctx){
  var current = context.getCurrent(ctx) 
    , expected = current[0], value = current[1];
 
  if (!(type(value) == 'Object')) return Success(identity);

  return (
    map( function(req){  
           return (req in value) ? Success(identity)
                    : Failure([Err.Single("missing " + req, ctx)]);
         },
         expected
    )
  );
}
