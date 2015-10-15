'use strict';
var chain = require('ramda/src/chain');
var flip = require('ramda/src/flip');
var compose = require('ramda/src/compose');
var apply = require('ramda/src/apply');
var of = require('ramda/src/of');

var context = require('./context');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

/***
 * Apply function to list of subcontexts, or return Failure if any invalid 
 * subcontexts.
 *
 *   (Context.Cursor -> Validation) -> Array (Path,Path) -> Context.Cursor -> Validation
 */
function applySubcontexts(fn,paths,ctx){
  return (
    chain( flip(context.subcontexts)(paths), ctx ).fold(
      compose(Failure, of),
      apply(fn)
    )
  );
}

module.exports = {
  applySubcontexts: applySubcontexts
}

