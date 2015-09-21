'use strict';
var map = require('ramda/src/map');
var append = require('ramda/src/append');
var path = require('ramda/src/path');
var dropLast = require('ramda/src/dropLast');
var T = require('ramda/src/T');
var Type = require('union-type');

var url = require('./url');

function isStringOrNumber(x){
  return typeof x === 'string' || typeof x === 'number' ;
}

// Note: refs must have normalized url keys
function resolveRef(refs,spath,schema,cyc){
  cyc = cyc || {}
  var cur = path(spath,schema);
  if (typeof cur == 'object' && '$ref' in cur){
    var ref = url.resolveTo(schema, cur['$ref'])
      , parts = url.getBaseAndPath(ref)
      , refdoc = parts[0], refpath = parts[1]; 

    if (ref in cyc){
      throw new Error("Cyclical reference detected: " + ref);
    } else if (url.isLocalTo(schema, ref)){
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
 * Focus on key of schema and key of value, specified as a pair
 */
var focusPair = Context.caseOn({
  Cursor: function focusCursor(refs,spath,vpath,schema,value,pair){
    var skey = pair[0], vkey = pair[1];
    var newspath = append(skey,spath), newvpath = append(vkey,vpath)
      , newvalue = path([vkey],value);
    var resolved = resolveRef(refs,newspath,schema)
      , rpath = resolved[0], rschema = resolved[1];

    return Context.Cursor(refs,
                          rpath,   newvpath, 
                          rschema, newvalue) ;
  }
});

/***
 * Focus on sibling schema and key of value, specified as a pair
 *  (used by items/additionalItems)
 */
var focusSiblingSchemaPair = Context.caseOn({
  Cursor: function focusSiblingSchemaCursor(refs,spath,vpath,schema,value,pair){
    var skey = pair[0], vkey = pair[1];
    var newspath = append(skey, dropLast(1,spath)), newvpath = append(vkey,vpath)
      , newvalue = path([vkey],value);
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
 */
var focusValue = Context.caseOn({
  Cursor: function focusValueCursor(refs,spath,vpath,schema,value,key){
    return Context.Cursor(refs,
                          spath,  append(key,vpath), 
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
 * Get schema at sibling key to current
 * (used by additionalProperties, e.g.)
 */
var getSiblingSchema = Context.caseOn({
  Cursor: function getSiblingSchema(refs,spath,vpath,schema,value,key){
    return path( append(key,dropLast(1,spath)), schema );
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
  focusPair: focusPair,
  focusSiblingSchemaPair: focusSiblingSchemaPair,
  getCurrent: getCurrent,
  getSiblingSchema: getSiblingSchema,
  getCurrentPath: getCurrentPath
}

