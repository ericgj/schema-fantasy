'use strict';
var curryN = require('ramda/src/curryN');
var chain = require('ramda/src/chain');
var Either = require('data.either');
var Err = require('./err').Err;

module.exports = curryN(2, function path(paths, obj) {
  if (obj == null) {
    return Either.Left(Err.Path('Missing',paths,''));
  } else {
    var val = Either.Right(obj);
    for (var idx = 0, len = paths.length; idx < len && val.isRight; idx += 1) {
      val = chain( eitherProp(paths.slice(0,idx),paths[idx]), val);
    }
    return val;
  }
});

var eitherProp = curryN(3, function _eitherProp(props,key,obj){
  if (typeof obj !== 'object') 
    return Either.Left(Err.Path('Not an object or array',props,''));
  return key in obj ? Either.Right(obj[key]) 
                    : Either.Left(Err.Path('Unknown property',props,key));
});

