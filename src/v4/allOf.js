const identity = require('ramda/src/identity');
const chain = require('ramda/src/chain');
const filter = require('ramda/src/filter');
const map = require('ramda/src/map');
const prop = require('ramda/src/prop');

const Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

const context = require('../context');
const Err = require('../err').Err;

module.exports = function allOf(validate,ctx){
  const [listOfSchemas, value] = context.getCurrent(ctx);
  const results = listOfSchemas.map( (schema,i) => (
                    validate(context.focusSchema(ctx,i)) 
                  ));
  const failResults = filter(prop('isFailure'), results);
  const failErrs = chain((v) => v.orElse(identity), failResults);

  return (
    failResults.length === 0 ? Success(identity)
      : Failure([Err.Compound("Not all conditions valid", ctx, failErrs)])
  );
}

