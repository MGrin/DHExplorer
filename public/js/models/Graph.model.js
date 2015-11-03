/**
* An Graph model.
* A simple Graph model with addNode, addEdge, clear and destroy functions
*
* Created by Nikita Grishin on 08.2015
*/

'use strict';

(function (app, Storage) {
  var Graph = app.models.Graph = function () {
    this.nodes = [];
    this.edges = [];

    this.hiddenNodes = [];
    this.hiddenEdges = [];

    this.nodesStorage = new Storage('graph-nodes');
    this.edgesStorage = new Storage('graph-edges');

    return true;
  };

  Graph.prototype.addNode = function (_node) {
    var node;

    if (!this.nodesStorage.has(_node.id)) {
      node = new app.models.Node(_node.id, _node.data, _node.type);
      this.nodesStorage.set(node.id, node);
      this.nodes.push(node);
    } else {
      node = this.nodesStorage.get(_node.id);
      node.setType(_node.type);
    }

    node.data = _node.data;
  };

  Graph.prototype.addEdge = function (_edge) {
    if (!this.nodesStorage.has(_edge.source) || !this.nodesStorage.has(_edge.target)) {
      return;
    }

    var edge;
    if (!this.edgesStorage.has(_edge.id)) {
      var source = this.nodesStorage.get(_edge.source);
      var target = this.nodesStorage.get(_edge.target);
      edge = new app.models.Edge(_edge.id, source, target, _edge.data);
      this.edges.push(edge);
      this.edgesStorage.set(edge.id, edge);
      edge.source.addNeighbour(edge.target.id);
      edge.target.addNeighbour(edge.source.id);
    }
  };

  Graph.prototype.clear = function () {
    while (this.nodes.length > 0) {
      this.nodesStorage.remove(this.nodes[0].id);
      this.nodes.splice(0, 1);
    }

    while (this.edges.length > 0) {
      this.edgesStorage.remove(this.edges[0].id);
      this.edges.splice(0, 1);
    }
  };

  Graph.prototype.destroy = function () {
    this.nodes = null;
    this.edges = null;

    this.nodesStorage.destroy();
    this.edgesStorage.destroy();
  };
})(window.app, window.app.Storage);
