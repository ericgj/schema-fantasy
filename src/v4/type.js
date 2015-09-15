'use strict';
var indexOf = require('ramda/src/indexOf');
var identity = require('ramda/src/identity');
var _type = require('ramda/src/type');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context');
var Err = require('../err').Err;

function typeOf(x){ return _type(x).toLowerCase(); }
function isInteger(x){ return typeOf(x) == 'number' && x === (x|0); }

module.exports = function type(ctx){
  var current = context.getCurrent(ctx) 
    , expected = current[0], value = current[1];
  
  var actual = typeOf(value);
  var types = ('array' == typeOf(expected) ? expected : [expected]);
  
  var valid = ( indexOf(actual, types) >=0 ||
                    (isInteger(value) && indexOf('integer', types)>=0)
                );
  return valid ? Success(identity) 
    : Failure([Err.Values("Invalid type", ctx, types.join(' or '), actual)]) ;
}

