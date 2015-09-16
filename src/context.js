/* globals URL:true */
'use strict';
var map = require('ramda/src/map');
var append = require('ramda/src/append');
var path = require('ramda/src/path');
var T = require('ramda/src/T');
var Type = require('union-type');

function isStringOrNumber(x){
  return typeof x === 'string' || typeof x === 'number' ;
}

var urllib, parseURL, dumpURL

// for Node.js
if (typeof URL == 'undefined'){ 
  urllib = require('url');
  parseURL = urllib.parse;
  dumpURL  = urllib.format;
} else {
  parseURL = function(str){ return new URL(str); }
  dumpURL  = function(url){ return url.toString(); }
}

function canonicalURL(url){
  return dumpURL(parseURL(url));
}

// TODO maybe there is a better way?
function isLocalPathRef(url){
  return url === parseURL(url).hash;
}

// TODO note this assumes the hash will start with '/'
function getDocumentAndPath(ref){
  var parts = ref.split('#')
  return [ parts[0], (parts[1] || '').split('/').slice(1) ];
}

function resolveRef(refs,spath,schema,cyc){
  cyc = cyc || {}
  var cur = path(spath,schema);
  if (typeof cur == 'object' && '$ref' in cur){
    var ref = canonicalURL(cur['$ref'])
      , parts = getDocumentAndPath(ref)
      , refdoc = parts[0], refpath = parts[1]; 

    if (ref in cyc){
      throw new Error("Cyclical reference detected: " + ref);
    } else if (isLocalPathRef(ref)){
      cyc[ref] = true;
      return resolveRef(refs, refpath, schema, cyc);
    } else if (refdoc in refs){
      cyc[ref] = true;
      return resolveRef(refs, refpath, refs[refdoc], cyc);
    } else {
      throw new Error("Unknown resource: " + refdoc);  // TODO replace with Either.Left?
    }
  }
  return [spath,schema];
}




/***
 * Initialize cursor at top of given schema and value
 * Note you should use this instead of calling Context.Cursor directly,
 *   in case top-level schema is a $ref
 */
var init = function init(refs,schema,value){
  var resolved = resolveRef(refs,[],schema)
    , rpath = resolved[0], rschema = resolved[1];
  return Context.Cursor(refs, rpath, [], rschema, value);
}


var Context = Type({
  Cursor: [Object, map(isStringOrNumber), map(isStringOrNumber), T, T]
});


/***
 * Focus on key of both schema and value
 * Note that entire schema is retained across contexts, while value is not.
 */
var focus = Context.caseOn({
  Cursor: function focusCursor(refs,spath,vpath,schema,value,key){
    var newspath = append(key,spath), newvpath = append(key,vpath)
      , newvalue = path([key],value);
    var resolved = resolveRef(refs,newspath,schema)
      , rpath = resolved[0], rschema = resolved[1];

    return Context.Cursor(refs,
                          rpath,   newvpath, 
                          rschema, newvalue) ;
  }
});

/***
 * Focus on key of schema for current value
 */
var focusSchema = Context.caseOn({
  Cursor: function focusSchemaCursor(refs,spath,vpath,schema,value,key){
    var newspath = append(key,spath);
    var resolved = resolveRef(refs,newspath,schema)
      , rpath = resolved[0], rschema = resolved[1];

    return Context.Cursor(refs,
                          rpath,   vpath, 
                          rschema, value) ;
  }
});

/***
 * Focus on key of value for current schema 
 * Note I don't think this is used and can be removed
 */
var focusValue = Context.caseOn({
  Cursor: function focusValueCursor(refs,spath,vpath,schema,value,key){
    return Context.Cursor(refs,
                          spath,  append(vpath,key), 
                          schema, path([key],value)) ;
  }
});

/***
 * Get current schema and value
 */
var getCurrent = Context.case({
  Cursor: function getCurrentCursor(refs,spath,vpath,schema,value){
    // console.log('~~~~~' + JSON.stringify([spath,vpath]));
    return [ path(spath,schema), value ];
  }
});

/***
 * Get current schema path and value path, not resolving refs
 */
var getCurrentPath = Context.case({
  Cursor: function getCurrentPathCursor(refs,spath,vpath,schema,value){
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

