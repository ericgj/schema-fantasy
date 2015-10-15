/* globals RegExp: true */
'use strict';
var identity = require('ramda/src/identity');
var type = require('ramda/src/type');
var curry = require('ramda/src/curry');
var map = require('ramda/src/map');
var commute = require('ramda/src/commute');
var flip = require('ramda/src/flip');
var chain = require('ramda/src/chain');
var of = require('ramda/src/of');
var apply = require('ramda/src/apply');
var partial = require('ramda/src/partial');
var compose = require('ramda/src/compose');
var filter = require('ramda/src/filter');
var keysIn = require('ramda/src/keysIn');
var prop = require('ramda/src/prop');
var none = require('ramda/src/none');
var zip = require('ramda/src/zip');
var head = require('ramda/src/head');
var last = require('ramda/src/last');
var Validation = require('data.validation')
    , Success = Validation.Success
    , Failure = Validation.Failure

var context = require('../context') 
  , Path = context.Path;
var Err = require('../err').Err;
var applySubcontexts = require('../helpers').applySubcontexts;
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


/* old
var failedProps = function _failedProps(ctx,props,errs){
  var msg = "additional propert" + (props.length == 1 ? "y" : "ies") + " invalid";
  var proplist = humanList("and",props);
  return Failure([Err.Compound([msg, proplist].join(": "), ctx, errs)]);
}
*/


/***
 *
 *   (Context.Cursor -> Validation) -> Either Err Context.Cursor -> Validation
 */
module.exports = function(validate,ctx){
  var paths = [
    [Path.Self(), Path.Self()],
    [Path.Sibling('properties'), Path.Self()],
    [Path.Sibling('patternProperties'), Path.Self()]
  ];

  return applySubcontexts(partial(additionalProperties,validate), paths, ctx);
}


function additionalProperties(validate,ctx,propctx,patpropctx){
  
  return context.getCurrent(ctx).fold(
    compose(Failure, of),
    apply(_additionalProperties)
  );
  
  function _additionalProperties(schema,value){

    var t = type(value), schtype = type(schema);

    if (t !== 'Object') return Success(identity);
    if (schema === true) return Success(identity);

    // per sec. 8.3.2
    var schprops = context.getSchema(propctx).getOrElse({}); 
    var schpatprops = context.getSchema(patpropctx).getOrElse({});

    var addprops = filter(isAddProp(schprops,schpatprops), keysIn(value)) ;
    if (addprops.length === 0) return Success(identity);

    if (schtype == 'Boolean'){
      return unknownProps(ctx,addprops);
    }

    if (schtype == 'Object'){

      // resolve subcontexts for each additional prop in value

      var addpaths = map( function(p){ return [Path.Self(),Path.Child(p)]; },
                          addprops
                    );

      return (
        context.subcontexts(ctx,addpaths).fold(
          compose(Failure, of),
          compose(commute(Validation.of), map(validate))
        )
      );
      
      
      /* old
      var results = zip(addprops, 
                        map( compose(validate, context.focusValue(ctx)), addprops)
                    );
      var failResults = filter( compose(prop('isFailure'), last), results);
      var failErrs = chain( getError, map(last, failResults));
      var failProps = map(head, failResults);

      return (failResults.length === 0) ? Success(identity)
        : failedProps(ctx, failProps, failErrs);
      */

    }

    return Success(identity);  // otherwise
  }

}

