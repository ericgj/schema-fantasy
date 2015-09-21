/* globals RegExp: true */
'use strict';
var identity = require('ramda/src/identity');
var type = require('ramda/src/type');
var curry = require('ramda/src/curry');
var map = require('ramda/src/map');
var chain = require('ramda/src/chain');
var compose = require('ramda/src/compose');
var filter = require('ramda/src/filter');
var keysIn = require('ramda/src/keysIn');
var prop = require('ramda/src/prop');
var none = require('ramda/src/none');
var zip = require('ramda/src/zip');
var head = require('ramda/src/head');
var last = require('ramda/src/last');
var path = require('ramda/src/path');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context');
var Err = require('../err').Err;
var humanList = require('../humanlist');

function getError(r){ return r.orElse(identity); }

var isAddProp = curry( function _isAddProp(props, patprops, p){
 return (!(p in props)) && 
        none( 
          function(rx){ 
            var matcher = new RegExp(rx); return matcher.test(p);
          },
          keysIn(patprops)
        ) ;

});

var unknownProps = curry( function _unknownProps(ctx,props){
  var msg = "additional propert" + (props.length == 1 ? "y" : "ies") + " found";
  var proplist = humanList("and",props);
  return Failure([Err.Single([msg, proplist].join(": "),ctx)]);
});

var failedProps = function _failedProps(ctx,props,errs){
  var msg = "additional propert" + (props.length == 1 ? "y" : "ies") + " invalid";
  var proplist = humanList("and",props);
  return Failure([Err.Compound([msg, proplist].join(": "), ctx, errs)]);
}


module.exports = function additionalProperties(validate,ctx){
  var cur = context.getCurrent(ctx)
    , schema = cur[0], value = cur[1], t = type(value), schtype = type(schema);

  if (t !== 'Object') return Success(identity);
  if (schema === true) return Success(identity);

  var schprops = context.getSiblingSchema(ctx,'properties'); 
  var schpatprops = context.getSiblingSchema(ctx,'patternProperties'); 

  // per sec. 8.3.2
  if (undefined === schprops) schprops = {};
  if (undefined === schpatprops) schpatprops = {};

  var addprops = filter(isAddProp(schprops,schpatprops), keysIn(value)) ;
  if (addprops.length === 0) return Success(identity);

  if (schtype == 'Boolean'){
    return unknownProps(ctx,addprops);
  }

  if (schtype == 'Object'){
    var results = zip(addprops, 
                      map( compose(validate, context.focusValue(ctx)), addprops)
                  );
    var failResults = filter( compose(prop('isFailure'), last), results);
    var failErrs = chain( getError, map(last, failResults));
    var failProps = map(head, failResults);

    return (failResults.length === 0) ? Success(identity)
      : failedProps(ctx, failProps, failErrs);
  }

  return Success(identity);  // otherwise
  
}

