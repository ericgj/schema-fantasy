const identity = require('ramda/src/identity');
const filter = require('ramda/src/filter');
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
  return (
    any( prop('isSuccess'), results) ? Success(identity)
      : Failure(["No conditions valid"]) // perhaps adding the failed conditions into the error structure
  );
}

