'use strict';

// String length taking into account supplementary Unicode chars
// Depends on having ES6 String.prototype.codePointAt or polyfill
// see https://github.com/mathiasbynens/String.prototype.codePointAt

if (!(String.prototype.codePointAt)) require('string.prototype.codepointat');

module.exports = function(str){
  if (!(str.codePointAt)) return str.length;
  var n = 0;
  for (var i=0;i<str.length;i++){
    if (str.codePointAt(i) > 0xFFFF) i++;
    n++;
  }
  return n;
}    
