/* globals URL:true */
'use strict';
var map = require('ramda/src/map');
var append = require('ramda/src/append');
var path = require('ramda/src/path');
var T = require('ramda/src/T');
var Type = require('union-type');

if (typeof URL == 'undefined'){ var URL = require('url').parse; }

function isStringOrNumber(x){
  return typeof x === 'string' || typeof x === 'number' ;
}

// quick and dirty for the moment
function isLocalPathRef(url){
  return url === new URL(url).hash;
}

function splitLocalPathRef(url){
  return new URL(url).hash.split('/').slice(1);  // remove the hash
}

function resolveRefPath(spath,schema){
  var cur = path(spath,schema);
  if (typeof cur == 'object' && '$ref' in cur){
    var ref = cur['$ref'];
    if (isLocalPathRef(ref)){
      return resolveRefPath(splitLocalPathRef(ref),schema);  // follow refs recursively 
    }
  }
  return spath;
}

/***
 * Initialize cursor at top of given schema and value
 * Note you should use this instead of calling Context.Cursor directly,
 *   in case top-level schema is a $ref
 */
var init = function init(schema,value){
  return Context.Cursor(resolveRefPath([],schema),[],schema,value);
}


var Context = Type({
  Cursor: [map(isStringOrNumber), map(isStringOrNumber), T, T]
});


/***
 * Focus on key of both schema and value
 * Note that entire schema is retained across contexts, while value is not.
 */
var focus = Context.caseOn({
  Cursor: function focusCursor(spath,vpath,schema,value,key){
    var newspath = append(key,spath), newvpath = append(key,vpath);
    return Context.Cursor(resolveRefPath(newspath,schema),  newvpath, 
                          schema,                           path([key],value)) ;
  }
});

/***
 * Focus on key of schema for current value
 */
var focusSchema = Context.caseOn({
  Cursor: function focusSchemaCursor(spath,vpath,schema,value,key){
    var newspath = append(key,spath);
    return Context.Cursor(resolveRefPath(newspath,schema),  vpath, 
                          schema,                           value) ;
  }
});

/***
 * Focus on key of value for current schema 
 * Note I don't think this is used and can be removed
 */
var focusValue = Context.caseOn({
  Cursor: function focusValueCursor(spath,vpath,schema,value,key){
    return Context.Cursor(spath,  append(vpath,key), 
                          schema, path([key],value)) ;
  }
});

/***
 * Get current schema and value
 */
var getCurrent = Context.case({
  Cursor: function getCurrentCursor(spath,vpath,schema,value){
    // console.log('~~~~~' + JSON.stringify([spath,vpath]));
    return [ path(spath,schema), value ];
  }
});

/***
 * Get current schema path and value path, not resolving refs
 */
var getCurrentPath = Context.case({
  Cursor: function getCurrentPathCursor(spath,vpath,schema,value){
    return [ spath, vpath ];
  }
});


module.exports = {
  init: init,
  Context: Context, 
  focus: focus, 
  focusSchema: focusSchema, 
  focusValue: focusValue, 
  getCurrent: getCurrent,
  getCurrentPath: getCurrentPath
}

