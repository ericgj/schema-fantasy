/* globals console: true */
'use strict';

var map = require('ramda/src/map');
var test = require('tape');

var err = require('../src/err');
var v = require('../index')
  , validateIn = v.validateIn;

var showSuccess = function(x){ return x.getOrElse("(valid)"); }
var showFailure = function(xs){ return map(err.toString, xs).join("\n") ; }

var SUITE = {
  // additionalItems: require('./JSON-Schema-Test-Suite/tests/draft4/additionalItems.json'),
  additionalProperties: require('./JSON-Schema-Test-Suite/tests/draft4/additionalProperties.json'),
  allOf: require('./JSON-Schema-Test-Suite/tests/draft4/allOf.json'),
  anyOf: require('./JSON-Schema-Test-Suite/tests/draft4/anyOf.json'),
  dependencies: require('./JSON-Schema-Test-Suite/tests/draft4/dependencies.json'),
  enum: require('./JSON-Schema-Test-Suite/tests/draft4/enum.json'),
  not: require('./JSON-Schema-Test-Suite/tests/draft4/not.json'),
  oneOf: require('./JSON-Schema-Test-Suite/tests/draft4/oneOf.json'),
  patternProperties: require('./JSON-Schema-Test-Suite/tests/draft4/patternProperties.json'),
  properties: require('./JSON-Schema-Test-Suite/tests/draft4/properties.json'),
  required: require('./JSON-Schema-Test-Suite/tests/draft4/required.json'),
  type: require('./JSON-Schema-Test-Suite/tests/draft4/type.json')
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
  var desc = expected.description;
  return function(assert){
    assert.plan(1);
    var actual = validateIn(schema, data);
    console.log( actual.fold(showFailure, showSuccess) );

    if (valid) { assert.ok( actual.isSuccess, "expected valid (" + desc + ")"  ); }
    else       { assert.ok( actual.isFailure, "expected invalid (" + desc + ")" ); }
  }
}


