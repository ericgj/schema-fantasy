'use strict';

module.exports = function humanList(last, list){
  if (list.length < 2){ 
    return list.join('');
  } else {
    return [list.slice(0,-1).join(', '), list.slice(-1)].join(' ' + last + ' ');
  }
}


