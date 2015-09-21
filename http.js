/* globals fetch: true */
'use strict';
var curry = require('ramda/src/curry');
var compose = require('ramda/src/compose');
var map = require('ramda/src/map');
var flip = require('ramda/src/flip');
var apply = require('ramda/src/apply');
var invoker = require('ramda/src/invoker');
var Either = require('data.either');

var _validate = require('./index').validate;
var linker = require('./src/linker');

if (typeof fetch == 'undefined') var fetch = require('node-fetch');

var promiseToTask = function(p){ 
  return new Task( function(req,res){ return p.then(res,rej); } ); 
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
 *  Link references and validate, capturing HTTP errors in an Either.Left
 *
 *  Object -> Object -> String -> a -> Either(Error, Validation)
 */
var validate = curry( function _validate(options, refs, u, value){
  var task = link(options, u, refs);
  var vfn = task.fork( Either.Left, compose(Either.Right, apply(_validate)) );
  return map( flip(apply)(value),  vfn);
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

module.exports = {
  validate: validate,
  link: link
}

