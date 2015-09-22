'use strict';
var identity = require('ramda/src/identity');
var type = require('ramda/src/type');
var uniq = require('ramda/src/uniq');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context');
var Err = require('../err').Err;

module.exports = function uniqueItems(ctx){
  var cur = context.getCurrent(ctx)
    , schema = cur[0], value = cur[1], t = type(value)
  
  if (t !== 'Array') return Success(identity);

  if (schema === false) return Success(identity);

  var n = value.length - uniq(value).length;

  return (
    (n === 0) ? Success(identity)
      : Failure([
          Err.Single("does not contain unique values: " + 
                     n + " duplicate" + (n === 1 ? "" : "s") + " found", ctx)
        ])
  );
}




