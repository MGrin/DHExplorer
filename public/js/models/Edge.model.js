/**
* An Edge model.
*
* Created by Nikita Grishin on 08.2015
*/

'use strict';

(function (app) {
  /**
   * @param {string} an edge id
   * @param {any} a source node
   * @param {any} a target node
   * @param {any} a data that this edge should hold
   */
  //TODO verify types of source and target node! Can be Node or string (id), I do not remember
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
