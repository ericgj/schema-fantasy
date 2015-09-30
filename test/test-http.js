'use strict';
var test = require('tape');
var http = require('../http');

var validateWithSchema = http.validateWithSchema(
                           {headers: {'Content-Type': 'application/json'}},
                           {}
                         );

test('', function(assert){
 
}
