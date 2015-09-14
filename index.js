const curry = require('ramda/src/curry');
const curryN = require('ramda/src/curryN');
const chain = require('ramda/src/chain');
const identity = require('ramda/src/identity');
const compose = require('ramda/src/compose');
const reduce = require('ramda/src/reduce');
const ap = require('ramda/src/ap');
const map = require('ramda/src/map');
const keysIn = require('ramda/src/keysIn');
const all = require('ramda/src/all');
const prop = require('ramda/src/prop');
const any = require('ramda/src/any');
const append = require('ramda/src/append');
const path = require('ramda/src/path');
const always = require('ramda/src/always');
const T = require('ramda/src/T');

const _type = require('ramda/src/type');
const indexOf = require('ramda/src/indexOf');

const Type = require('union-type');
const Validation = require('data.validation');
const Maybe = require('data.maybe');

const Success = Validation.Success;
const Failure = Validation.Failure;
const Nothing = Maybe.Nothing;

const flatten = chain(identity);
const isStringOrNumber = (x) => typeof x === 'string' || typeof x === 'number'
const typeOf = compose((t) => t.toLowerCase(), _type);

/* future
const allOf = require('./src/v4/allOf');
const anyOf = require('./src/v4/anyOf');
const oneOf = require('./src/v4/oneOf');
*/

/*******************************************************************************
 * Validate
 * Evaluate each predicate function on given context, and then apply each 
 * Validation result (or array of results) to the 'root' validation
 */
const validate = curry( (schema, value) => (
  validateContext( Context.Cursor([],[],schema,value) )
));

const validateContext = (ctx) => {
  const [schema, value] = getCurrent(ctx);
  const evalPred = compose(evaluate, getPred(ctx));
  const valids = flatten( map(evalPred, keysIn(schema)) );
  const root = valids.length === 0 ? Success(Nothing)
                                   : Success(curryN(valids.length, Nothing));
  return reduce( ap, root, valids );
};


module.exports = {validate, validateContext}


/*******************************************************************************
 * Get predicate eval function from schema key and context
 * getPred :: Context.Cursor c -> String k -> Predicate k c
 */
const getPred = curry( (ctx, key) => {
  if (!(key in Predicate)) return Predicate.UNKNOWN();
  return Predicate[key](focusSchema(ctx,key)) ;
});



/*******************************************************************************
 * allOf predicate   
 * Context.Cursor -> Validation
 */
const allOf = (ctx) => {
  const [listOfSchemas, value] = getCurrent(ctx);
  const results = listOfSchemas.map( (schema,i) => (
                    validateContext(focusSchema(ctx,i)) 
                  ));
  return (
    all( prop('isSuccess'), results) ? Success(identity)
      : Failure(["Not all conditions valid"])   // perhaps adding the failed conditions into the error structure
  );
};

/*******************************************************************************
 * anyOf predicate   
 * Context.Cursor -> Validation
 */
const anyOf = (ctx) => {
  const [listOfSchemas, value] = getCurrent(ctx);
  const results = listOfSchemas.map( (schema,i) => (
                    validateContext(focusSchema(ctx,i)) 
                  ));
  return (
    any( prop('isSuccess'), results) ? Success(identity)
      : Failure(["No conditions valid"]) // perhaps adding the failed conditions into the error structure
  );
}

/*******************************************************************************
 * oneOf predicate   
 * Context.Cursor -> Validation
 */
const oneOf = (ctx) => {
  const [listOfSchemas, value] = getCurrent(ctx);
  const results = listOfSchemas.map( (schema,i) => (
                    validateContext(focusSchema(ctx,i)) 
                  ));
  const successResults = filter(Validation.isSuccess, results);
  return (
    successResults.length === 1 ? Success(identity)
      : successResults.length === 0 ? Failure(["No conditions valid"]) 
      : Failure(["More than one condition valid"])
  );
}

/*******************************************************************************
 * properties predicate   
 * Context.Cursor -> Array Validation
 */
const properties = (ctx) => {
  const [propSchemas, value] = getCurrent(ctx);
  return map((p) => validateContext(focus(ctx,p)), keysIn(propSchemas) );
}


const type = (ctx) => {
  const [expected, value] = getCurrent(ctx);
  
  const actual    = typeOf(value)
      , isinteger = (actual == 'number' && value === (value|0) )

  const types = ('array' == typeOf(expected) ? expected : [expected]);
  
  const valid = ( indexOf(actual, types) >=0 ||
                    (isinteger && indexOf('integer', types)>=0)
                );
  return valid ? Success(identity) : Failure(["Invalid type"]) ;
}

/*******************************************************************************
 * Types 
 */

const Context = Type({
  Cursor: [map(isStringOrNumber), map(isStringOrNumber), Object, T]
});

const focus = Context.caseOn({
  Cursor: (spath,vpath,schema,value,key) => (
    Context.Cursor(append(key,spath), append(key,vpath), schema, value)
  )
});

const focusSchema = Context.caseOn({
  Cursor: (spath,vpath,schema,value,key) => (
    Context.Cursor(append(key,spath), vpath, schema, value)
  )
});

const focusValue = Context.caseOn({
  Cursor: (spath,vpath,schema,value,key) => (
    Context.Cursor(spath, append(vpath,key), schema, value)
  )
});

const getCurrent = Context.case({
  Cursor: (spath,vpath,schema,value) => (
    [ path(spath,schema), path(vpath,value) ]
  )
});

const Predicate = Type({
  allOf: [Context.Cursor],
  anyOf: [Context.Cursor],
  oneOf: [Context.Cursor],
  properties: [Context.Cursor],
  type: [Context.Cursor],
  UNKNOWN: []
});

const evaluate = Predicate.case({
  allOf, anyOf, oneOf, properties, type,
  _: always(Success(identity))  // ignore unknown schema keys == always return success
});



