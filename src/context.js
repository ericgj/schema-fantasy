'use strict';
var map = require('ramda/src/map');
var append = require('ramda/src/append');
var path = require('ramda/src/path');
var T = require('ramda/src/T');
var Type = require('union-type');

function isStringOrNumber(x){
  return typeof x === 'string' || typeof x === 'number' ;
}

var Context = Type({
  Cursor: [map(isStringOrNumber), map(isStringOrNumber), T, T]
});

var focus = Context.caseOn({
  Cursor: function focusCursor(spath,vpath,schema,value,key){
    return Context.Cursor(append(key,spath),  append(key,vpath), 
                          path([key],schema), path([key],value)) ;
  }
});

var focusSchema = Context.caseOn({
  Cursor: function focusSchemaCursor(spath,vpath,schema,value,key){
    return Context.Cursor(append(key,spath),  vpath, 
                          path([key],schema), value) ;
  }
});

var focusValue = Context.caseOn({
  Cursor: function focusValueCursor(spath,vpath,schema,value,key){
    return Context.Cursor(spath,  append(vpath,key), 
                          schema, path([key],value)) ;
  }
});

var getCurrent = Context.case({
  Cursor: function getCurrentCursor(spath,vpath,schema,value){
    return [ schema, value ];
  }
});

var getCurrentPath = Context.case({
  Cursor: function getCurrentPathCursor(spath,vpath,schema,value){
    return [ spath, vpath ];
  }
});

module.exports = {
  Context: Context, 
  focus: focus, 
  focusSchema: focusSchema, 
  focusValue: focusValue, 
  getCurrent: getCurrent,
  getCurrentPath: getCurrentPath
}

