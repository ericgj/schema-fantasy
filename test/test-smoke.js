const identity = require('ramda/src/identity');
const map = require('ramda/src/map');
const test = require('tape');
const Maybe = require('data.maybe');

const v = require('../index');

test('allOf', (assert) => {

  const schema = {
    allOf: [
      { type: 'integer' }
    ]
  }

  const act = v.validate(schema, 1);
  assert.ok( act.isSuccess, "validation succeeded");
  
  const act2 = v.validate(schema, 1.1);
  assert.ok( act2.isFailure, "validation failed");
  console.log( act2.fold(map(v.errToString), identity) );

  assert.end();
});

test('properties', (assert) => {

  const schema = {
    properties: {
      a: { type: 'string' },
      b: { type: 'number' },
      c: { type: ['string','number'] }
    }
  };

  const act = v.validate(schema, {a: '1', b: 2, c: 3});
  console.log( act.fold(identity, (x) => x.isNothing) );
  assert.ok( act.isSuccess, "validation succeeded");
  
  const act2 = v.validate(schema, {a: '1', b: '2', c: null});
  console.log( act2.fold(map(v.errToString),identity) );
  assert.ok( act2.isFailure, "validation failed");

  assert.end();
});

test('unknown predicate', (assert) => {
  
  const schema = { fantasy: 'foo' }

  const act = v.validate(schema, {});
  assert.ok( act.isSuccess, "validation succeeded");

  assert.end();
});

test('empty schema', (assert) => {

  const schema = {}
  const act = v.validate(schema, false);
  console.log( act.fold(identity, identity) );
  assert.ok( act.isSuccess, "validation succeeded");
  assert.ok( act.fold(()=> false, (x) => x.isNothing), "returns Nothing");

  assert.end();

});

