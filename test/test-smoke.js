const identity = require('ramda/src/identity');
const test = require('tape');

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
  console.log( act2.fold(identity, identity) );

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
  console.log( act.fold(identity,identity) );
  assert.ok( act.isSuccess, "validation succeeded");
  
  const act2 = v.validate(schema, {a: 1, b: '2', c: null});
  console.log( act2.fold(identity,identity) );
  assert.ok( act2.isFailure, "validation failed");

  assert.end();
});
