'use strict';
var map = require('ramda/src/map');
var identity = require('ramda/src/identity');
var type = require('ramda/src/type');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context');
var Err = require('../err').Err;

module.exports = function required(ctx){
  var current = context.getCurrent(ctx) 
    , expected = current[0], value = current[1];
 
  if (type(value) !== 'Object') return Success(identity);

  return (
    map( function(req){  
           return (req in value) ? Success(identity)
                    : Failure([Err.Single("missing " + req, ctx)]);
         },
         expected
    )
  );
}
