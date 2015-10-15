'use strict';
var indexOf = require('ramda/src/indexOf');
var identity = require('ramda/src/identity');
var of = require('ramda/src/of');
var compose = require('ramda/src/compose');
var identity = require('ramda/src/identity');
var apply = require('ramda/src/apply');
var getType = require('ramda/src/type');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context');
var Err = require('../err').Err;


function typeOf(x){ return getType(x).toLowerCase(); }
function isInteger(x){ return typeOf(x) == 'number' && x === (x|0); }

module.exports = function(ctx){
  return ctx.fold( compose(Failure, of), type);
}

function type(ctx){
  return context.getCurrent(ctx).fold(
    compose(Failure, of),
    apply(_type)
  );

  function _type(expected, value){
    var actual = typeOf(value);
    var types = ('array' == typeOf(expected) ? expected : [expected]);
    
    var valid = ( indexOf(actual, types) >=0 ||
                      (isInteger(value) && indexOf('integer', types)>=0)
                  );
    return valid ? Success(identity) 
      : Failure([Err.Values("Invalid type", ctx, types.join(' or '), actual)]) ;
  }
}

