var url = require('url');

function normalize(u){
  return url.format(url.parse(u));
}

function resolveTo(schema,u){
  return schema.id ? url.resolve(normalize(schema.id), normalize(u)) 
                   : normalize(u);
}

function isLocalTo(schema,u){
  var cur = (schema.id ? normalize(schema.id) : '').split('#')[0] ;
  var target = resolveTo(schema,u).split('#')[0];
  return cur == target;
}

// TODO note this assumes the hash will start with '/'
function getDocAndPath(u){
  var parts = normalize(u).split('#');
  return [ parts[0], (parts[1] || '').split('/').slice(1) ];
}

module.exports = {
  normalize: normalize,
  resolveTo: resolveTo,
  isLocalTo: isLocalTo,
  getDocAndPath: getDocAndPath
};
