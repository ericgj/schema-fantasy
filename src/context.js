const map = require('ramda/src/map');
const append = require('ramda/src/append');
const path = require('ramda/src/path');
const T = require('ramda/src/T');
const Type = require('union-type');

const isStringOrNumber = (x) => typeof x === 'string' || typeof x === 'number'

const Context = Type({
  Cursor: [map(isStringOrNumber), map(isStringOrNumber), T, T]
});

const focus = Context.caseOn({
  Cursor: (spath,vpath,schema,value,key) => (
    Context.Cursor(append(key,spath),  append(key,vpath), 
                   path([key],schema), path([key],value))
  )
});

const focusSchema = Context.caseOn({
  Cursor: (spath,vpath,schema,value,key) => (
    Context.Cursor(append(key,spath),  vpath, 
                   path([key],schema), value)
  )
});

const focusValue = Context.caseOn({
  Cursor: (spath,vpath,schema,value,key) => (
    Context.Cursor(spath,  append(vpath,key), 
                   schema, path([key],value))
  )
});

// sugar
const getCurrent = Context.case({
  Cursor: (spath,vpath,schema,value) => (
    [ schema, value ]
  )
});

module.exports = {Context, focus, focusSchema, focusValue, getCurrent}

