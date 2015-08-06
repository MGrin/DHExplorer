'use strict';

(function (app) {
  var Edge = function (id, source, target, data) {
    this.id = id;
    this.source = source;
    this.target = target;

    this.data = data;
  };

  Edge.generateId = function (sourceId, targetId, predicateValue, hashFn) {
    return [sourceId, targetId].sort().join('-') + '-' + hashFn(predicateValue);
  };

  if (app) {
    app.models.Edge = Edge;
  } else {
    module.exports = Edge;
  }
})((typeof(window) !== 'undefined') ? window.app : null);