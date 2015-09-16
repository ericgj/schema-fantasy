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

  var act = v.validateIn(schema, 1);
  assert.ok( act.isSuccess, "validation succeeded");
  
  var act2 = v.validateIn(schema, 1.1);
  assert.ok( act2.isFailure, "validation failed");
  console.log( act2.fold(map(e.toString), identity) );

  var act3 = v.validateIn(schema, "1");
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

  var act = v.validateIn(schema, {a: '1', b: 2, c: 3});
  console.log( act.fold(identity, prop('isNothing')) );
  assert.ok( act.isSuccess, "validation succeeded");
  
  var act2 = v.validateIn(schema, {a: '1', b: '2', c: null});
  console.log( act2.fold(map(e.toString),identity) );
  assert.ok( act2.isFailure, "validation failed");

  assert.end();
});

test('unknown predicate', function(assert){
  
  var schema = { fantasy: 'foo' }

  var act = v.validateIn(schema, {});
  assert.ok( act.isSuccess, "validation succeeded");

  assert.end();
});

test('empty schema', function(assert){

  var schema = {}
  var act = v.validateIn(schema, false);
  console.log( act.fold(identity, identity) );
  assert.ok( act.isSuccess, "validation succeeded");
  assert.ok( act.fold(F, prop('isNothing')), "returns Nothing");

  assert.end();

});

test('local ref', function(assert){

  var schema = {
    definitions: {
      person: { type: 'object', required: ["name","pants-size"] }
    },
    properties: {
      owner: { $ref: '#/definitions/person' }
    }
  }

  var act = v.validateIn(schema, {owner: {name: 'Biggy', "pants-size": 44} });
  console.log( act.fold(identity, identity) );
  assert.ok( act.isSuccess, "validation succeeded");

  var act2 = v.validateIn(schema, {owner: {name: 'Shy'}});
  console.log( act2.fold(map(e.toString),identity) );
  assert.ok( act2.isFailure, "validation failed");

  assert.end();
});
  
test('local ref at top level', function(assert){

  var schema = {
    definitions: {
      person: { type: 'object', required: ["name","pants-size"] }
    },
    $ref: '#/definitions/person'
  }

  var act = v.validateIn(schema, {name: 'Biggy', "pants-size": 44});
  console.log( act.fold(identity, identity) );
  assert.ok( act.isSuccess, "validation succeeded");

  var act2 = v.validateIn(schema, {name: 'Shy'});
  console.log( act2.fold(map(e.toString),identity) );
  assert.ok( act2.isFailure, "validation failed");

  assert.end();
});


test('remote ref', function(assert){

  
  var schema = {
    properties: {
      'bake-time': { type: 'number' }
    },
    allOf: [ { $ref: 'http://fruitbreads-of-the-world.com/schemas#/definitions/recipe' } ]
  }

  var refschema = {
    definitions: {
      recipe: {
        required: ["ingredients"],
        properties: {
          ingredients: { type: "array" }
        }
      }
    }
  }

  var cache = {
    'http://fruitbreads-of-the-world.com/schemas': refschema
  }
  
  var act = v.validate(cache, schema, 
                       {'name': 'plum torte', 'bake-time': 45, 'ingredients': [] });
  console.log( act.fold(identity, identity) );
  assert.ok( act.isSuccess, "validation succeeded");

  var act2 = v.validate(cache, schema, 
                        {'name': 'flopbread', 'bake-time': '1 hr or so'  });
  console.log( act2.fold(map(e.toString),identity) );
  assert.ok( act2.isFailure, "validation failed");

  assert.end();
});


test('relative refs', function(assert){

  var schema = {
    id: 'http://fake-school.edu/schema/student',
    properties: {
      grade: { $ref: 'value-types#/definitions/grade' }
    },
    required: ['grade']
  }

  var schema2 = {
    definitions: {
      grade: { type: ['number','string'], enum: [4,3,2,1,'U','NA'] }
    }
  }

  var cache = {
    'http://fake-school.edu/schema/student': schema,
    'http://fake-school.edu/schema/value-types': schema2
  }

  var act = v.validate(cache, schema, {grade: 'U'}); 
  console.log( act.fold(identity, identity) );
  assert.ok( act.isSuccess, "validation succeeded");

  var act2 = v.validate(cache, schema, {grade: 'none'});
  console.log( act2.fold(map(e.toString),identity) );
  assert.ok( act2.isFailure, "validation failed");

  assert.end();
});


test('cyclical refs should throw', function(assert){

  var schemaA = {
    properties: {
      B: { $ref: 'http://B/schema#/properties/C' }
    }
  };

  var schemaB = {
    properties: {
      C: { $ref: 'http://C/schema#/properties/A' }
    }
  };

  var schemaC = {
    properties: {
      A: { $ref: 'http://A/schema#/properties/B' }
    }
  };

  var cache = {
    'http://a/schema': schemaA,
    'http://b/schema': schemaB,
    'http://c/schema': schemaC
  };

  assert.throws( function(){ return v.validate(cache, schemaA, {}); } );
  assert.throws( function(){ return v.validate(cache, schemaB, {}); } );
  assert.throws( function(){ return v.validate(cache, schemaC, {}); } );

  assert.end();

});


