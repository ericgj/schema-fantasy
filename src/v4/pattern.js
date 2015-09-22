/* globals RegExp: true */
'use strict';
var identity = require('ramda/src/identity');
var type = require('ramda/src/type');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context');
var Err = require('../err').Err;

module.exports = function pattern(ctx){
  var cur = context.getCurrent(ctx)
    , schema = cur[0], value = cur[1], t = type(value)
  
  if (t !== 'String') return Success(identity);

  var rx = new RegExp(schema);
  return (
    (rx.test(value)) ? Success(identity)
      : Failure([Err.Single("does not match /" + schema + "/", ctx)])
  );
}




