const indexOf = require('ramda/src/indexOf');
const identity = require('ramda/src/identity');
const _type = require('ramda/src/type');
const Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

const context = require('../context');
const Err = require('../err').Err;

const typeOf = (x) => _type(x).toLowerCase()
const isInteger = (x) => typeOf(x) == 'number' && x === (x|0)

module.exports = function type(ctx){
  const [expected, value] = context.getCurrent(ctx);
  
  const actual    = typeOf(value);
  const types = ('array' == typeOf(expected) ? expected : [expected]);
  
  const valid = ( indexOf(actual, types) >=0 ||
                    (isInteger(value) && indexOf('integer', types)>=0)
                );
  return valid ? Success(identity) 
    : Failure([Err.Actual("Invalid type", ctx, actual)]) ;
}

