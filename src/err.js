const filter = require('ramda/src/filter');
const map = require('ramda/src/map');
const compose = require('ramda/src/compose');
const not = require('ramda/src/not');
const isEmpty = require('ramda/src/isEmpty');

const Type = require('union-type');

const Context = require('./context').Context;

const compact = filter(compose(not, isEmpty));

const Err = Type({
  Single:   [String, Context.Cursor],          // message, context
  Compound: [String, Context.Cursor, Array],   // message, context, array of Err
  Values:   [String, Context.Cursor, String, String],  // message, context, expected, actual 
});

const toString = Err.case({
  
  Single: (msg,ctx) => {
    const [spath,vpath,schema,value] = ctx;
    const pathstr = vpath.join('/');
    return compact([pathstr, msg]).join(': ');
  },

  Compound: (msg,ctx,errs) => {
    const [spath,vpath,schema,value] = ctx;
    const countstr = [errs.length, errs.length === 1 ? "error" : "errors", "found"].join(" "); 
    const pathstr = vpath.join('/');
    const msgs = map(toString, errs);
    return [ compact([pathstr, msg, countstr]).join(': '), 
             msgs.join("\n")
           ].join("\n");
  },

  Values: (msg,ctx,exp,act) => {
    const [spath,vpath,schema,value] = ctx;
    const pathstr = vpath.length === 0 ? '' : vpath.join('/') + ': ';
    return compact([pathstr, msg, "expected " + exp + ", was " + act]).join(': ');
  }

});

module.exports = {Err, toString}
