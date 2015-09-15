'use strict';
var filter = require('ramda/src/filter');
var map = require('ramda/src/map');
var compose = require('ramda/src/compose');
var not = require('ramda/src/not');
var isEmpty = require('ramda/src/isEmpty');

var Type = require('union-type');

var context = require('./context')
  , Context = context.Context;

var compact = filter(compose(not, isEmpty));

var Err = Type({
  Single:   [String, Context.Cursor],          // message, context
  Compound: [String, Context.Cursor, Array],   // message, context, array of Err
  Values:   [String, Context.Cursor, String, String]  // message, context, expected, actual 
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
  }

});

module.exports = {Err: Err, toString: toString}

