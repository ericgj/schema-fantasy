var url = require('url');

function normalize(u){
  return url.format(url.parse(u));
}

function resolve(u1,u2){
  return url.resolve(normalize(u1), normalize(u2));
}

function resolveTo(schema,u){
  return schema.id ? resolve(schema.id, u) 
                   : normalize(u);
}

function isLocalTo(schema,u){
  var cur = (schema.id ? normalize(schema.id) : '').split('#')[0] ;
  var target = resolveTo(schema,u).split('#')[0];
  return cur == target;
}

// TODO note this assumes the hash will start with '/'
function getBaseAndPath(u){
  var parts = normalize(u).split('#');
  return [ parts[0], (parts[1] || '').split('/').slice(1) ];
}

function getBase(u){ return getBaseAndPath(u)[0]; }
function getPath(u){ return getBaseAndPath(u)[1]; }

module.exports = {
  normalize: normalize,
  resolve: resolve,
  resolveTo: resolveTo,
  isLocalTo: isLocalTo,
  getBaseAndPath: getBaseAndPath,
  getBase: getBase,
  getPath: getPath
};
