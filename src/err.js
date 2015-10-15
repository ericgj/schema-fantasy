'use strict';
var filter = require('ramda/src/filter');
var map = require('ramda/src/map');
var all = require('ramda/src/all');
var compose = require('ramda/src/compose');
var not = require('ramda/src/not');
var isEmpty = require('ramda/src/isEmpty');

var Type = require('union-type');

var context = require('./context');

var compact = filter(compose(not, isEmpty));

function isStringOrNumber(x){
  return typeof x === 'string' || typeof x === 'number' ;
}

function isContext(x){
  return ('of' in x) && x.of === context.Context;
}

var Err = Type({
  Single:   [String, isContext],          // message, context
  Compound: [String, isContext, Array],   // message, context, array of Err
  Values:   [String, isContext, String, String],  // message, context, expected, actual 
  Type:     [isContext, String, String],          // context, expected, actual
  Ref:      [String, all(isStringOrNumber), String],   // message, context path array, ref url
  Path:     [String, all(isStringOrNumber), isStringOrNumber]   // message, context path array, key
});

var toString = Err.case({
  
  Single: function toStringSingle(msg,ctx){
    var cur = context.getCurrent(ctx)
      , schema = cur[0], value = cur[1];
    var curpath = context.getCurrentPath(ctx)
      , spath = curpath[0], vpath = curpath[1];
    var pathstr = vpath.join('/');
    return compact([pathstr, msg]).join(': ');
  },

  Compound: function toStringCompound(msg,ctx,errs){
    var cur = context.getCurrent(ctx)
      , schema = cur[0], value = cur[1];
    var curpath = context.getCurrentPath(ctx)
      , spath = curpath[0], vpath = curpath[1];
    var countstr = [errs.length, errs.length === 1 ? "error" : "errors",
                    "found"].join(" "); 
    var pathstr = vpath.join('/');
    var msgs = map(toString, errs);
    return [ compact([pathstr, msg, countstr]).join(': '), 
             msgs.join("\n")
           ].join("\n");
  },

  Values: function toStringValues(msg,ctx,exp,act){
    var cur = context.getCurrent(ctx)
      , schema = cur[0], value = cur[1];
    var curpath = context.getCurrentPath(ctx)
      , spath = curpath[0], vpath = curpath[1];
    var pathstr = vpath.join('/');
    return compact([pathstr, 
                    msg, 
                    "expected " + exp + ", was " + act
                   ]).join(': ');
  },

  Type: function toStringType(ctx,exp,act){
    return toString(Err.Values("unexpected type",ctx,exp,act));
  },

  Ref: function toStringRef(msg,path,url){
    var pathstr = path.join('/');
    return compact([pathstr, "Reference error", msg, url]).join(': ');
  },

  Path: function toStringPath(msg,path,key){
    var pathstr = path.join('/');
    return compact([pathstr, "Path error", msg, key]).join(': ');
  }

});

module.exports = {Err: Err, toString: toString}

