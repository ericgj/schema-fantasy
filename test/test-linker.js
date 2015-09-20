/* globals console: true */
'use strict';
var compose = require('ramda/src/compose');
var map = require('ramda/src/map');
var flip = require('ramda/src/flip');
var prop = require('ramda/src/prop');
var identity = require('ramda/src/identity');
var equals = require('ramda/src/equals');
var Task = require('data.task');
var Type = require('union-type');

var test = require('tape');
var linker = require('../src/linker');

test('refsIn', function(assert){
  
  var schema = {
    properties: {
      literal: {$ref: 'http://example.com/schema/literal#/a/b/c'},
      relative: {$ref: '/relative/path#/a/b/c' },
      internal: {$ref: '#/definitions/a/b/c' },
      inarray: { allOf: [ { $ref: '0#/a/b/c' }, { $ref: '1#/a/b/c'} ] }
    }
  }

  var act = linker.refsIn('http://example.com/schema/test', schema);
  console.log(act);
  assert.ok( act.indexOf('http://example.com/schema/literal') >= 0, 'extracted literal');
  assert.ok( act.indexOf('http://example.com/relative/path') >= 0, 'extracted relative path');
  assert.ok( act.indexOf('http://example.com/schema/test') >= 0, 'extracted internal');
  assert.ok( act.indexOf('http://example.com/schema/0') >= 0, 'extracted in array');
  assert.ok( act.indexOf('http://example.com/schema/1') >= 0, 'extracted in array');

  assert.end();
});
 
test('refsIn, no refs', function(assert){

  var schema = {};

  var act = linker.refsIn('http://example.com/schema/empty', schema);
  console.log(act);
  assert.equal( act.length, 0, 'no refs');
  assert.end();
});

test('refsIn, top level ref', function(assert){

  var schema = {
    $ref: 'top'
  }

  var act = linker.refsIn('http://example.com/schema/test', schema);
  console.log(act);
  assert.ok( act.indexOf('http://example.com/schema/top') >= 0, 'extracted top level');

  assert.end();
});


test('link, in-memory (no http)', function(assert){

  // the fake internet
  // like the real thing, it has circular references ;)
  var universe = {

    'http://universe.com/schema/a': {
      'properties': {
        'mass': { type: 'array', 'items': { $ref: 'c#/definitions/measure'} },
        'temperature': { $ref: 'http://universe.com/schema/c#/definitions/measure' },
        'inhabitants': { 'items': { $ref: 'b'} }
      },
      'required': {$ref: 'c#/definitions/required' }   // a bit non-standard
    },

    'http://universe.com/schema/b': {
      links: [
        {rel: 'zone', href: 'a/{zone}', schema: {$ref: 'a'} }
      ],
      properties: {
        kingdom: {$ref: 'c#/definitions/kingdom'}
      }
    },

    'http://universe.com/schema/c':  {
      definitions: {
        measure: { type: 'array', items: [{type: 'numeric'}, {type: 'string'}] },
        required: ['mass','inhabitants'],
        kingdom: { 'enum': ['animal','vegetable','mineral'] }
      }
    }

  };

  // the fake http client
  var getter = compose( map(flip(prop)(universe)), Task.of);  


  var task = linker.link(getter, 'http://universe.com/schema/b', {});
  var act = task.fork(identity, identity);
  console.log(act);

  assert.ok( !(act instanceof Error), "task resolved" );
  assert.equal( act.length, 2 );

  assert.equals(Object.keys(act[0]).length, 3, "fetched 3 schemas");
  for (var k in act[0]){
    assert.ok( equals(act[0][k],universe[k]), "fetched link " + k );
  }
  
  assert.ok( equals(act[1], universe['http://universe.com/schema/b']),
             'fetched requested schema' );

  assert.end();

});
