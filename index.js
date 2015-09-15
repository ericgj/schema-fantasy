'use strict';

var curry = require('ramda/src/curry');
var curryN = require('ramda/src/curryN');
var chain = require('ramda/src/chain');
var identity = require('ramda/src/identity');
var compose = require('ramda/src/compose');
var reduce = require('ramda/src/reduce');
var ap = require('ramda/src/ap');
var map = require('ramda/src/map');
var keysIn = require('ramda/src/keysIn');

var Type = require('union-type');
var Validation = require('data.validation');
var Maybe = require('data.maybe');

var Success = Validation.Success;
var Failure = Validation.Failure;
var Nothing = Maybe.Nothing;

var context = require('./src/context')
  , Context = context.Context;
var predicate = require('./src/predicate')
  , Predicate = predicate.Predicate;

/*******************************************************************************
 * Validate
 * Evaluate each predicate function on given context, and then apply each 
 * Validation result (or array of results) to the 'root' validation
 */
var validate = curry( function validate(schema, value){
  return validateContext( Context.Cursor([],[],schema,value) )
});

function validateContext(ctx){
  var schema = context.getCurrent(ctx)[0];
  var evalPred = compose(predicate.evaluate, getPred(ctx));
  var valids = chain(evalPred, keysIn(schema));
  var root = valids.length === 0 ? Success(Nothing())
                                 : Success(curryN(valids.length, Nothing));
  return reduce( ap, root, valids );
}

/*******************************************************************************
 * Get predicate eval function from schema key and context
 * getPred :: Context.Cursor c -> String k -> Predicate k c   
 *  or     :: Context.Cursor c -> String k -> Predicate k Function c
 */
var getPred = curry( function getPred(ctx, key){
  if (!(key in Predicate)) return Predicate.UNKNOWN();
  var pred = Predicate[key], n = pred.length;  // check arity of predicate function
  var args = ( n === 0        ? []
               : n === 1      ? [context.focusSchema(ctx,key)]
               /*otherwise*/  : [validateContext, context.focusSchema(ctx,key)]
             );
  return pred.apply(pred,args); 
});


module.exports = {validate: validate, validateContext: validateContext}

