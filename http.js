/* globals fetch: true */
'use strict';
var curry = require('ramda/src/curry');
var compose = require('ramda/src/compose');
var map = require('ramda/src/map');
var flip = require('ramda/src/flip');
var apply = require('ramda/src/apply');
var invoker = require('ramda/src/invoker');
var chain = require('ramda/src/chain');
var assoc = require('ramda/src/assoc');
var Either = require('data.either');
var Task = require('data.task');

var __validate = require('./index').validate;
var linker = require('./src/linker');

var fetch = (typeof window == 'undefined') || 
            (typeof window != 'undefined' && !('fetch' in window)) ? 
              require('node-fetch') : window.fetch ;

var promiseToTask = function(p){ 
  return new Task( function(rej,res){ return p.then(res,rej); } ); 
}

// Object -> String -> Task(Error, Response)
var getUrl = curry( function _getUrl(options,u){ 
  options = assoc('method', 'GET', options);
  return promiseToTask(fetch(u, options));
});

// Response -> Task(Error, Object)
var getJSON = compose(promiseToTask, invoker(0,'json'));


// Object -> String -> Task(Error, Object)
var getSchema = curry( function _getSchema(options,u){
  return chain(getJSON, getUrl(options,u));
});



/*******************************************************************************
 * validate
 *  Link references and validate
 *
 *  Object -> Object -> String -> a -> Task(Error, Validation)
 */
var validate = curry( function _validate(options, refs, u, value){
  var task = link(options, u, refs);
  return map( flip(apply)(value), map( apply(__validate), task));
});

var validateWithSchema = curry( function _validateWithSchema(options, refs, schema, value){
  var task = linkSchema(options, schema, refs);
  return map( flip(apply)(value), map( apply(__validate), task));
});
  

/*******************************************************************************
 * link
 *  Link references using HTTP
 *
 *  Object -> String -> Object -> Task(Error, (Object, Object)) 
 */
var link = function link(options, u, cache){
  return linker.link(getSchema(options), u, cache);
}

var linkSchema = function linkSchema(options, obj, cache){
  return linker.linkSchema(getSchema(options), obj, cache);
}

module.exports = {
  validate: validate,
  validateWithSchema: validateWithSchema,
  link: link,
  linkSchema: linkSchema
}

