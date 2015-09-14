const identity = require('ramda/src/identity');
const filter = require('ramda/src/filter');
const prop = require('ramda/src/prop');

const Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

const context = require('../context');
const Err = require('../err').Err;

module.exports = function oneOf(validate,ctx){
  const [listOfSchemas, value] = context.getCurrent(ctx);
  const results = listOfSchemas.map( (schema,i) => (
                    validate(focusSchema(ctx,i)) 
                  ));
  const successResults = filter(prop('isSuccess'), results);
  return (
    successResults.length === 1 ? Success(identity)
      : successResults.length === 0 ? Failure(["No conditions valid"]) 
      : Failure(["More than one condition valid"])
  );
}


