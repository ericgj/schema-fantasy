'use strict';

/***
 * Note: these tests require a CORS-enabled web server serving files under
 * ./test/remotes on port 8080.  `make test-server` will do this.
 * 
 */

var map = require('ramda/src/map');
var test = require('tape');
var http = require('../http');
var err = require('../src/err');

var SERVER_ORIGIN = 'http://localhost:8080';

var validate = http.validate(
                     {headers: {'Content-Type': 'application/json'}},
                     {}
                   );

var showSuccess = function(x){ return x.getOrElse("(valid)"); }
var showFailure = function(xs){ return map(err.toString, xs).join("\n") ; }

function createValidateTest(label,exp,uri,value){
  
  test(label, function(assert){
    // assert.plan(1);
    var task = validate(uri,value);

    task.fork(
      function(e){ console.log('Error'); console.log(e); },
      function(actual){

        console.log( actual.fold(showFailure, showSuccess) );

        if (exp) { 
          assert.equal( actual.isSuccess, exp, 
                        "expected valid (" + label + ")");
        } else { 
          assert.equal( actual.isSuccess, exp, 
                        "expected invalid (" + label + ")");
        }
      }
   );

   setTimeout( function(){ assert.end(); }, 500);
  });
}

createValidateTest("simple valid", true, SERVER_ORIGIN + "/simple/array",
  ["1","2"]
);

createValidateTest("simple invalid", false, SERVER_ORIGIN + "/simple/array",
  ["1"]
);

createValidateTest("simple invalid nested", false, SERVER_ORIGIN + "/simple/array",
  ["1",2]
);


createValidateTest("jcard valid", true, SERVER_ORIGIN + "/jcard/card",
  ["jcard", [ ["version", {}, "text", "4.0"] ]]
);


