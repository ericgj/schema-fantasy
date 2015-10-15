/* globals console: true */
'use strict';
var identity = require('ramda/src/identity');
var map = require('ramda/src/map');
var F = require('ramda/src/F');
var test = require('tape');

var v = require('../index');
var err = require('../src/err');

var noop = function(){};
var isErrType = function(t,x){ return x.name == t; };

function assertSuccess(assert,act){
  assert.ok(act.isSuccess, "expected validation success");
}

function assertFailureOf(assert,t,act){
  assert.ok(act.isFailure, "expected validation failure");
  act.fold(
    function(es){
      assert.equal( es.length, 1, "expected one error");
      assert.ok( isErrType(t, es[0]), "expected Err." + t + " error type, was " + es[0].name);
    },
    noop
  );
}

test('top level schema is an unknown local ref', function(assert){
  var schema = {
    $ref: '#/definitions/unknown'
  }

  var act = v.validateIn(schema,{});
  console.log( act.fold( map(err.toString), identity ) );
  assertFailureOf(assert,'Path',act);
  assert.end();
});

test('top level schema is an unknown remote ref', function(assert){
  var schema = {
    $ref: 'http://imaginary.com#/definitions/unknown'
  }

  var act = v.validateIn(schema,{});
  console.log( act.fold( map(err.toString), identity ) );
  assert.ok(act.isFailure, "expected validation failure");
  assertFailureOf(assert,'Ref',act);
  assert.end();
});

test('schema has an unknown local ref', function(group){
  var schema = {
    definitions: {
      a: { type: 'number' }
    },
    properties: {
      a: { $ref: '#/definitions/a' },
      b: { $ref: '#/definitions/b' },
      c: { type: 'object' }
    }
  }

  group.test('  and value subject to it', function(assert){
    var act = v.validateIn(schema,{b: 2});
    console.log( act.fold( map(err.toString), identity ) );
    assertFailureOf(assert,'Path',act);
    assert.end();
  });

  group.test('  and value not subject to it', function(assert){
    var act = v.validateIn(schema,{a: 1});
    console.log( act.fold( map(err.toString), identity ) );
    assertSuccess(assert,act);
    assert.end();
  });

  group.end();
});

test('schema has an unknown remote ref', function(group){
  var schema = {
    definitions: {
      a: { type: 'number' }
    },
    properties: {
      a: { $ref: '#/definitions/a' },
      b: { $ref: 'http://over-the-rainbow.edu/#definitions/b' },
      c: { type: 'object' }
    }
  }

  group.test('  and value subject to it', function(assert){
    var act = v.validateIn(schema,{b: 2});
    console.log( act.fold( map(err.toString), identity ) );
    assertFailureOf(assert,'Ref',act);
    assert.end();
  });

  group.test('  and value not subject to it', function(assert){
    var act = v.validateIn(schema,{a: 1});
    console.log( act.fold( map(err.toString), identity ) );
    assertSuccess(assert,act);
    assert.end();
  });

  group.end();
});

