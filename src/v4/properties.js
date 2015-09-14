const map = require('ramda/src/map');
const keysIn = require('ramda/src/keysIn');

const context = require('../context');

module.exports = function properties(validate,ctx){
  const [propSchemas, value] = context.getCurrent(ctx);
  return map((p) => validate(context.focus(ctx,p)), keysIn(propSchemas) );
}


