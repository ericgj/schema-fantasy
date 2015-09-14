const Type = require('union-type');

const Context = require('./context').Context;

const Err = Type({
  Compound: [String, Context.Cursor, Array],   // message, context, array of Err
  Actual:   [String, Context.Cursor, String],  // message, context, actual 
});

const toString = Err.case({
  Compound: (msg,ctx,errs) => {
    const [spath,vpath,schema,value] = ctx;
    const pathstr = vpath.length === 0 ? '' : vpath.join('/') + ': ';
    return `${pathstr}${msg}: ${errs.length} of ${schema.length} failed`
  },
  Actual: (msg,ctx,actual) => {
    const [spath,vpath,schema,value] = ctx;
    const pathstr = vpath.length === 0 ? '' : vpath.join('/') + ': ';
    return `${pathstr}${msg}: expected ${JSON.stringify(schema)}, was ${JSON.stringify(actual)}`;
  }
});

module.exports = {Err, toString}
