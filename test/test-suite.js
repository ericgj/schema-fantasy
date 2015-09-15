/* globals console: true */
'use strict';

var map = require('ramda/src/map');
var test = require('tape');

var err = require('../src/err');
var validate = require('../index').validate;

var showSuccess = function(x){ return x.getOrElse("~~~ valid ~~~"); }


var SUITE = {
  // additionalItems: require('./JSON-Schema-Test-Suite/tests/draft4/additionalItems.json'),
  allOf: require('./JSON-Schema-Test-Suite/tests/draft4/allOf.json'),
  type: require('./JSON-Schema-Test-Suite/tests/draft4/type.json'),
  required: require('./JSON-Schema-Test-Suite/tests/draft4/required.json')
};


test('JSON Schema Test Suite', function(t){
  for (var group in SUITE){
    t.test(group, groupTests(SUITE[group]));
  }
});

function groupTests(tests){
  return function(t){
    for (var i=0;i<tests.length;++i){
      t.test(tests[i].description, featureTests(tests[i]));
    }
  }
}

function featureTests(feature){
  var schema = feature.schema;
  var tests  = feature.tests;
  return function(t){
    for (var i=0;i<tests.length;++i){
      t.test(tests[i].description, singleTest(schema, tests[i]));
    }
  }
}

function singleTest(schema, expected){
  var data = expected.data;
  var valid = expected.valid;
  return function(assert){
    assert.plan(1);
    var actual = validate(schema, data);
    console.log( "  " + actual.fold(map(err.toString), showSuccess) );

    if (valid) { assert.ok( actual.isSuccess, "expected valid" ); }
    else       { assert.ok( actual.isFailure, "expected invalid" ); }
  }
}


