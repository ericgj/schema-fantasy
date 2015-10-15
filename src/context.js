'use strict';
var map = require('ramda/src/map');
var identity = require('ramda/src/identity');
var of = require('ramda/src/of');
var chain = require('ramda/src/chain');
var curry = require('ramda/src/curry');
var all = require('ramda/src/all');
var commute = require('ramda/src/commute');
var append = require('ramda/src/append');
//var path = require('ramda/src/path');
var dropLast = require('ramda/src/dropLast');
var commute = require('ramda/src/commute');
var compose = require('ramda/src/compose');
var flip = require('ramda/src/flip');
var apply = require('ramda/src/apply');
var prepend = require('ramda/src/prepend');
var prop = require('ramda/src/prop');
var T = require('ramda/src/T');

var Type = require('union-type');
var Either = require('data.either'); 

var url = require('./url');
var path = require('./path');  // either-ified
var Err = require('./err').Err;

function isStringOrNumber(x){
  return typeof x === 'string' || typeof x === 'number' ;
}

var treis = require('treis');


var Path = Type({
  Self:    [],
  Child:   [ isStringOrNumber ],
  Sibling: [ isStringOrNumber ]
});

/***
 * Set key in given path array
 *   Path -> Array String|Number -> Array String|Number
 */
var setPath = Path.caseOn({
  Self: identity,
  Child: append,
  Sibling: function(k,arr){ return append(k,dropLast(1,arr)); }
});

/***
 * Get value from given value at Path
 *   Path -> a -> Either Err b
 */
var getValue = Path.caseOn({
  Self: compose(Either.Right, identity),
  Child: function(k,v){ return path([k],v); }
});



var Context = Type({
  Cursor: [Object, all(isStringOrNumber), all(isStringOrNumber), T, T]
});

/***
 * Initialize cursor at top of given schema and value
 * Note you should use this instead of calling Context.Cursor directly,
 *   in case top-level schema is a $ref
 *
 *  Object -> Object -> a -> Either Err Context.Cursor
 */
var init = function init(refs,schema,value){
  return focus(Context.Cursor(refs,[],[],schema,value), 
               [Path.Self(), Path.Self()]
         );
}

/***
 * Focus cursor to given (schema Path, value Path)
 *
 *   Schema -> (Path, Path) -> Either Err Context.Cursor
 */
var focus = Context.caseOn({
  Cursor: function focusCursor(refs,spath,vpath,schema,value,paths){
    var newspath  = setPath(paths[0],spath);
    var newsvalue = resolveRef(refs, newspath, schema);
    var newvpath  = setPath(paths[1],vpath);
    var newvalue  = getValue(paths[1],value);     
    
    return map( apply(function(s,v){
                        return Context.Cursor(refs, s[0], newvpath, s[1], v);
                      }),
               commute(Either.Right, [newsvalue, newvalue])
    );
  }
});
   
/***
 * Return list of cursors given list of (schema Path, value Path)
 * Note: commutes list of Eithers to Either of list
 * 
 *   Schema -> Array (Path, Path) -> Either Err (Array Context.Cursor)
 */
var subcontexts = Context.caseOn({
  Cursor: function subcontextsCursor(refs,spath,vpath,schema,value,paths){
    return commute(Either.Right,
                   map( focus(Context.Cursor(refs,spath,vpath,schema,value)), 
                        paths)
                  );
  }
});


/***
 * Get current schema and value
 *
 *   Context.Cursor -> Either Err (a, b)
 */
var getCurrent = Context.case({
  Cursor: function getCurrentCursor(refs,spath,vpath,schema,value){
    return map( function(m){ return [ m, value ]; }, path(spath,schema) );
  }
});


/***
 * Get current schema
 *
 *   Context.Cursor -> Either Err a
 */
var getSchema = Context.case({
  Cursor: function getSchemaCursor(refs,spath,vpath,schema,value){
    return path(spath,schema);
  }
});


/***
 * Resolve ref at schema spath in refs, or return [spath,schema] if no ref
 * Note: refs must have normalized url keys
 * Returns an Either, with error (Left) states for cyclical refs and unknown paths
 *
 *  Object -> Array String|Number -> Object -> Object -> Either Err.Ref ((Array String|Number), Object)
 */
function resolveRef(refs,spath,schema,cyc){
  cyc = cyc || {}
  var cur = path(spath,schema);
  return chain( function(s){
      if (typeof s == 'object' && '$ref' in s){
        var ref = url.resolveTo(schema, s['$ref'])
          , parts = url.getBaseAndPath(ref)
          , refdoc = parts[0], refpath = parts[1]; 

        if (ref in cyc){
          return Either.Left(Err.Ref('Cyclical reference detected',spath,ref));
        } else if (url.isLocalTo(schema, ref)){
          cyc[ref] = true;
          return resolveRef(refs, refpath, schema, cyc);
        } else if (refdoc in refs){
          cyc[ref] = true;
          return resolveRef(refs, refpath, refs[refdoc], cyc);
        } else {
          return Either.Left(Err.Ref('Unknown resource',spath,refdoc));
        }
      }
      return Either.Right([spath,schema]);
    },
    cur
  );
}

module.exports = {
  Path: Path,
  Context: Context, 
  init: init,
  focus: focus, 
  subcontexts: subcontexts,
  getCurrent: getCurrent,
  getSchema: getSchema
}

