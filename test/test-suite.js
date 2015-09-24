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
  additionalItems: require('./JSON-Schema-Test-Suite/tests/draft4/additionalItems.json'),
  additionalProperties: require('./JSON-Schema-Test-Suite/tests/draft4/additionalProperties.json'),
  allOf: require('./JSON-Schema-Test-Suite/tests/draft4/allOf.json'),
  anyOf: require('./JSON-Schema-Test-Suite/tests/draft4/anyOf.json'),
  default: require('./JSON-Schema-Test-Suite/tests/draft4/default.json'),
  dependencies: require('./JSON-Schema-Test-Suite/tests/draft4/dependencies.json'),
  enum: require('./JSON-Schema-Test-Suite/tests/draft4/enum.json'),
  items: require('./JSON-Schema-Test-Suite/tests/draft4/items.json'),
  maximum: require('./JSON-Schema-Test-Suite/tests/draft4/maximum.json'),
  maxItems: require('./JSON-Schema-Test-Suite/tests/draft4/maxItems.json'),
  maxLength: require('./JSON-Schema-Test-Suite/tests/draft4/maxLength.json'),
  maxProperties: require('./JSON-Schema-Test-Suite/tests/draft4/maxProperties.json'),
  minimum: require('./JSON-Schema-Test-Suite/tests/draft4/minimum.json'),
  minItems: require('./JSON-Schema-Test-Suite/tests/draft4/minItems.json'),
  minLength: require('./JSON-Schema-Test-Suite/tests/draft4/minLength.json'),
  minProperties: require('./JSON-Schema-Test-Suite/tests/draft4/minProperties.json'),
  multipleOf: require('./JSON-Schema-Test-Suite/tests/draft4/multipleOf.json'),
  not: require('./JSON-Schema-Test-Suite/tests/draft4/not.json'),
  oneOf: require('./JSON-Schema-Test-Suite/tests/draft4/oneOf.json'),
  pattern: require('./JSON-Schema-Test-Suite/tests/draft4/pattern.json'),
  patternProperties: require('./JSON-Schema-Test-Suite/tests/draft4/patternProperties.json'),
  properties: require('./JSON-Schema-Test-Suite/tests/draft4/properties.json'),
  required: require('./JSON-Schema-Test-Suite/tests/draft4/required.json'),
  type: require('./JSON-Schema-Test-Suite/tests/draft4/type.json'),
  uniqueItems: require('./JSON-Schema-Test-Suite/tests/draft4/uniqueItems.json')
};


test('JSON Schema Test Suite', function(t){
  for (var group in SUITE){
    t.test(group, groupTests(group,SUITE[group]));
  }
});

function groupTests(group,tests){
  return function(t){
    for (var i=0;i<tests.length;++i){
      t.test(tests[i].description, featureTests(group,tests[i]));
    }
  }
}

function featureTests(group,feature){
  var schema = feature.schema;
  var tests  = feature.tests;
  var desc   = feature.description;
  return function(t){
    for (var i=0;i<tests.length;++i){
      t.test(tests[i].description, singleTest(group, desc, schema, tests[i]));
    }
  }
}

function singleTest(group, feature, schema, expected){
  var data = expected.data;
  var valid = expected.valid;
  var desc = expected.description;
  return function(assert){
    assert.plan(1);
    var actual = validateIn(schema, data);
    console.log( actual.fold(showFailure, showSuccess) );

    if (valid) { 
      assert.equal( actual.isSuccess, valid, 
                    "expected valid (" + [group, feature, desc].join('; ') + ")");
    } else { 
      assert.equal( actual.isSuccess, valid, 
                    "expected invalid (" + [group, feature, desc].join('; ') + ")");
    }
  }
}

