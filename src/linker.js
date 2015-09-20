/* globals fetch: true */
'use strict';
var head = require('ramda/src/head');
var map = require('ramda/src/map');
var chain = require('ramda/src/chain');
var reduce = require('ramda/src/reduce');
var curry = require('ramda/src/curry');
var compose = require('ramda/src/compose');
var assoc = require('ramda/src/assoc');
var invoker = require('ramda/src/invoker');
var valuesIn = require('ramda/src/valuesIn');
var type = require('ramda/src/type');
var filter = require('ramda/src/filter');
var not = require('ramda/src/not');
var hasIn = require('ramda/src/hasIn');
var flip = require('ramda/src/flip');
var Type = require('union-type');
var Task = require('data.task');

if (typeof fetch == 'undefined') var fetch = require('node-fetch');

var url = require('./url');


/*******************************************************************************
 * link
 *  Link function isolated from HTTP (or any other transport).
 *
 *  Given a getter function, url, and cache object, return a task resolving to a 
 *  tuple of `[cache, schema]`, where `cache` has the target schema and all 
 *  recursively dependent schemas loaded, and `schema` is the schema at the 
 *  requested url. (This tuple can then be applied to the validation function.)
 *
 *  Note the algorithm organizes the loading of dependent schemas as a _single 
 *  task_ of _chained fetches_. Dependent schemas are filtered on each load to 
 *  avoid duplicate fetching/circular chains.
 * 
 *  The passed `getter` function should take a url and return a Task resolving 
 *  to the fetched schema.
 *
 *  Function -> String -> Object -> Task(Error, (Object, Object))
 */
var link = function link(getter,u,cache){
  cache = Link.Cache(cache || {}, []);
  var getSchemaTuple = function(u){
    return map( schemaTuple(u), getter(u));
  }
  return map( flip(cacheRefsAndSchema)(u), _link(getSchemaTuple, u, cache) );
}

// String -> Object -> (String, Object, Array(String))
var schemaTuple = curry( function _schemaTuple(u,schema){
  return [schemaBase(u,schema), schema, refsIn(u,schema)];
});

// Function(String -> Task(Error, Tuple)) -> String -> Link.Cache -> Task(Error, Link.Cache)
var _link = curry( function __link(getter, u, cache){
  var linkTask = map(cacheUpdate(cache), getter(u));
  return chain( _links(getter), linkTask);
});

// Function(String -> Task(Error, Tuple)) -> Link.Cache -> Task(Error, Link.Cache)
var _links = curry( function __links(getter, cache){
  var urls = cache[1];
  if (urls.length > 0){
    return reduce( _chainLinkToTask(getter), Task.of(cache), urls);
  }
  return Task.of(cache);  // no more dependencies, return current state
});

// Function(String -> Task(Error, Tuple)) -> Task(Error, Link.Cache) -> String -> Task(Error, Link.Cache)
var _chainLinkToTask = curry( function __chainLinkToTask(getter,task,u){
  return chain( _link(getter,u), task);
});


/*******************************************************************************
 * Link.Cache type 
 * Passed between chained tasks, used to update cache
 *
 */
var Link = Type({
  Cache: [Object, map(String)]   
});

var cacheUpdate = Link.caseOn({
  Cache: function(cache, _, tuple){   // url, schema, array(url)
    var url = tuple[0], schema = tuple[1], deps = tuple[2];
    var newCache = assoc(url, schema, cache); 
    var newDeps = filter( compose(not, flip(hasIn)(newCache)), deps );
    return Link.Cache(newCache, newDeps);
  }
});

var cacheRefsAndSchema = Link.caseOn({
  Cache: function(cache,_,u){
    var base = url.getBase(u);
    return (base in cache) ? [cache,cache[base]] : [cache,{}] ;
  }
});



/*******************************************************************************
 * refsIn
 * Extract and normalize/resolve all $ref bases in schema (as array)
 * String -> Object -> Array(String)
 */
var refsIn = curry( function _refsIn(base,schema){
  base = schemaBase(base,schema);  // note only gets top-level schema.id
  if (type(schema) == 'Object'){
    if ('$ref' in schema){
      return [ url.getBase(url.resolve(base, schema['$ref'])) ];
    } else {
      return chain(refsIn(base), valuesIn(schema));
    }
  } else if (type(schema) == 'Array'){
    return chain(refsIn(base), schema);
  } else {
    return [];
  }
});

var schemaBase = curry( function _schemaBase(u,schema){
  return url.getBase( u || schema.id || '');
});


module.exports = {
  link: link,
  refsIn: refsIn,
  schemaBase: schemaBase
}


