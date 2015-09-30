'use strict';

// Note: not optimized, but allows indefinite arity (unlike Ramda's)
// Taken from http://robotlolita.me/2013/12/08/a-monad-in-practicality-first-class-failures.html

module.exports = function curryN(n, f){
  return function _curryN(as) { return function() {
    var args = as.concat([].slice.call(arguments))
    return args.length < n?  _curryN(args)
    :      /* otherwise */   f.apply(null, args)
  }}([])
}