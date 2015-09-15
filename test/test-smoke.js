/* globals console: true */
'use strict';
var identity = require('ramda/src/identity');
var prop = require('ramda/src/prop');
var F = require('ramda/src/F');
var map = require('ramda/src/map');
var test = require('tape');
var Maybe = require('data.maybe');

var v = require('../index');
var e = require('../src/err');

test('allOf', function(assert){

  var schema = {
    allOf: [
      { type: 'integer' },
      { type: 'number'  }
    ]
  }

  var act = v.validate(schema, 1);
  assert.ok( act.isSuccess, "validation succeeded");
  
  var act2 = v.validate(schema, 1.1);
  assert.ok( act2.isFailure, "validation failed");
  console.log( act2.fold(map(e.toString), identity) );

  var act3 = v.validate(schema, "1");
  assert.ok( act3.isFailure, "validation failed");
  console.log( act3.fold(map(e.toString), identity) );

  assert.end();
});

test('properties', function(assert){

  var schema = {
    properties: {
      a: { type: 'string' },
      b: { type: 'number' },
      c: { type: ['string','number'] }
    }
  };

  var act = v.validate(schema, {a: '1', b: 2, c: 3});
  console.log( act.fold(identity, prop('isNothing')) );
  assert.ok( act.isSuccess, "validation succeeded");
  
  var act2 = v.validate(schema, {a: '1', b: '2', c: null});
  console.log( act2.fold(map(e.toString),identity) );
  assert.ok( act2.isFailure, "validation failed");

  assert.end();
});

test('unknown predicate', function(assert){
  
  var schema = { fantasy: 'foo' }

  var act = v.validate(schema, {});
  assert.ok( act.isSuccess, "validation succeeded");

  assert.end();
});

test('empty schema', function(assert){

  var schema = {}
  var act = v.validate(schema, false);
  console.log( act.fold(identity, identity) );
  assert.ok( act.isSuccess, "validation succeeded");
  assert.ok( act.fold(F, prop('isNothing')), "returns Nothing");

  assert.end();

});

