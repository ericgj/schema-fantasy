const identity = require('ramda/src/identity');
const filter = require('ramda/src/filter');
const chain = require('ramda/src/chain');
const prop = require('ramda/src/prop');

const Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

const context = require('../context');
const Err = require('../err').Err;

module.exports = function anyOf(validate,ctx){
  const [listOfSchemas, value] = context.getCurrent(ctx);
  const results = listOfSchemas.map( (schema,i) => (
                    validate(focusSchema(ctx,i)) 
                  ));
  
  const failResults = filter(prop('isFailure'),results);
  const failErrs = chain((v) => v.orElse(identity), failResults);

  return (  
    (failResults.length < results.length) ? Success(identity)
      : Failure([Err.Compound("No conditions valid", ctx, failErrs)])
  );
}

