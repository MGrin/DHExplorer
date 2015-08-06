'use strict';

(function (app) {
  var Node = function (id, data, type) {
    this.id = id;
    this.data = data;
    this.type = type;

    this.neighbours = [];
  };

  Node.createFromEntity = function (entity) {
    var node = new Node(entity.id, entity.tuple, entity.type);
    return node;
  };

  Node.prototype.addNeighbour = function (nodeId) {
    if (this.neighbours.indexOf(nodeId) !== -1) return;
    this.neighbours.push(nodeId);
  };

  Node.prototype.setType = function (type) {
    if (!this.type || this.type === 'no-type') this.type = type;
  };

  Node.prototype.getLabel = function () {
    var graphNameRegexp = new RegExp(app.QueryController.graphName + '?(.*)', 'i');

    var splittedValue = graphNameRegexp.exec(this.data.value);
    if (!splittedValue) return this.data.value;

    var label = splittedValue[splittedValue.length - 1];

    label = label.replace(/_/g, ' ');
    return label;
  };

  if (app) {
    Node.prototype.isVisible = function () {
      if (!this.type) return false;

      var type = app.Storage.NodeType.get(this.type);
      if (!type) return false;
      return type.isVisible;
    };

    Node.prototype.getType = function () {
      if (!this.type) this.type = 'no-type';

      return app.Storage.NodeType.get(this.type);
    };

    app.models.Node = Node;
  } else {
    module.exports = Node;
  }
})((typeof(window) !== 'undefined') ? window.app : null);