/* globals fetch: true */
'use strict';
var nth = require('ramda/src/nth');
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

// note: not sure what node lib to use yet
// if (typeof fetch == 'undefined') var fetch = require('node-fetch');

var url = require('./url');

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


/*******************************************************************************
 * getSchemaTuple
 * HTTP client for linking schemas. Returns a Task resolving to a tuple used 
 * to update the cache: [url, schema, dependent-urls].
 *
 * Object -> String -> Task(Error, (String, Object, Array(String)))
 * 
 */
var getSchemaTuple = curry( function _getSchemaTuple(options,u){
  return map(schemaTuple(u), chain(getJSON, getUrl(options,u)));
});

/*******************************************************************************
 * schemaTuple
 * Extracts references (dependent URLs) from given schema and returns tuple.
 * 
 * String -> Object -> (String, Object, Array(String))
 *
 */
var schemaTuple = curry( function _schemaTuple(u,schema){
  return [schemaBase(u,schema), schema, refsIn(u,schema)];
});



/*******************************************************************************
 * link
 * Given http options, a url, and cache object, return a task resolving to a 
 * cache with the target schema and all recursively dependent schemas loaded.
 *
 * Note the algorithm organizes the loading of dependent schemas as a _single 
 * task_ of _chained fetches_. Dependent schemas are filtered on each load to 
 * avoid duplicate fetching/circular chains.
 * 
 * Object -> String -> Object -> Task(Error, Object) 
 */
var link = function link(options,u,cache){
  return linkWith(getSchemaTuple(options), u, cache);
}

/*******************************************************************************
 * linkWith
 * link function isolated from HTTP. The passed function should take a url and
 * return a Task resolving to a tuple of [url, schema, dependent-urls]. That is,
 * it should have the same type signature as `getSchemaTuple(options)`.
 *
 * Function -> String -> Object -> Task(Error, Object)
 */
var linkWith = function linkWith(getter,u,cache){
  cache = Link.Cache(cache || {}, []);
  return map( nth(0), _link(getter, u, cache) );
}

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
  linkWith: linkWith,
  refsIn: refsIn,
  schemaBase: schemaBase,
  schemaTuple: schemaTuple
}


