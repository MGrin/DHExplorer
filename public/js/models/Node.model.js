'use strict';

(function (app) {
  var Node = function (id, entity, data) {
    this.id = id;
    this.entity = entity;
    this.data = data;
  };

  if (app) {
    app.models.Node = Node;
  } else {
    module.exports = Node;
  }
})((typeof(window) !== 'undefined') ? window.app : null);
