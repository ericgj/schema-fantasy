const curry = require('ramda/src/curry');
const curryN = require('ramda/src/curryN');
const chain = require('ramda/src/chain');
const identity = require('ramda/src/identity');
const compose = require('ramda/src/compose');
const reduce = require('ramda/src/reduce');
const ap = require('ramda/src/ap');
const map = require('ramda/src/map');
const keysIn = require('ramda/src/keysIn');

const Type = require('union-type');
const Validation = require('data.validation');
const Maybe = require('data.maybe');

const Success = Validation.Success;
const Failure = Validation.Failure;
const Nothing = Maybe.Nothing;

const context = require('./src/context')
    , Context = context.Context;
const predicate = require('./src/predicate')
    , Predicate = predicate.Predicate;

/*******************************************************************************
 * Validate
 * Evaluate each predicate function on given context, and then apply each 
 * Validation result (or array of results) to the 'root' validation
 */
const validate = curry( (schema, value) => (
  validateContext( Context.Cursor([],[],schema,value) )
));

function validateContext(ctx){
  const [schema, value] = context.getCurrent(ctx);
  const evalPred = compose(predicate.evaluate, getPred(ctx));
  const valids = chain(evalPred, keysIn(schema));
  const root = valids.length === 0 ? Success(Nothing())
                                   : Success(curryN(valids.length, Nothing));
  return reduce( ap, root, valids );
}

/*******************************************************************************
 * Get predicate eval function from schema key and context
 * getPred :: Context.Cursor c -> String k -> Predicate k c   
 *  or     :: Context.Cursor c -> String k -> Predicate k Function c
 */
const getPred = curry( (ctx, key) => {
  if (!(key in Predicate)) return Predicate.UNKNOWN();
  const pred = Predicate[key], n = pred.length;  // check arity of predicate function
  const args = (n === 0        ? []
                : n === 1      ? [context.focusSchema(ctx,key)]
                /*otherwise*/  : [validateContext, context.focusSchema(ctx,key)]
               );
  return pred.apply(pred,args); 
});


module.exports = {validate, validateContext}

