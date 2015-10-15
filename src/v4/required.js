'use strict';
var map = require('ramda/src/map');
var identity = require('ramda/src/identity');
var of = require('ramda/src/of');
var apply = require('ramda/src/apply');
var compose = require('ramda/src/compose');
var type = require('ramda/src/type');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure;

var context = require('../context');
var Err = require('../err').Err;

module.exports = function(ctx){
  return ctx.fold( compose(Failure,of), required);
}

function required(ctx){
  return (
    context.getCurrent(ctx).fold(
      compose(Failure, of),
      apply(_required)
    )
  );

  function _required(expected, value){
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
}
