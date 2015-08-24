'use strict';

(function (app) {
  var Entity = function (id, tuple, type, variable) {
    this.id = id;
    this.tuple = tuple;
    this.type = type || 'no-type';
    this.variable = variable;

    this.predicates = {};
    this.objects = {};
    this.origins = {};

    this.completed = this.isLiteral();
  };

  Entity.castFromObject = function (obj) {
    var entity = new Entity(obj.id, obj.tuple, obj.type);
    entity.predicates = obj.predicates;
    entity.objects = obj.objects;
    entity.origins = obj.origins;

    entity.updateAllConnections();
    return entity;
  };

  Entity.prototype.updateAllConnections = function () {
    for (var predIdx in this.predicates) {
      if (this.predicates[predIdx]) {
        var entityId = this.origins[predIdx] || this.objects[predIdx];
        var connectionType = this.origins[predIdx] ? 'object' : 'origin';

        var entity = app.Storage.Entity.get(entityId);
        if (!entity) continue;

        if (entity.predicates[predIdx]) continue;
        entity.predicates[predIdx] = this.predicates[predIdx];

        if (connectionType === 'object' && entity.objects[predIdx]) continue;
        if (connectionType === 'origin' && entity.origins[predIdx]) continue;

        if (connectionType === 'object') {
          entity.objects[predIdx] = this.id;
        } else {
          entity.origins[predIdx] = this.id;
        }
      }
    }
  };

  Entity.prototype.addRelation = function (id, predicate, target) {
    if (this.predicates[id] || this.objects[id]) {
      return;
    }

    this.predicates[id] = predicate;
    this.objects[id] = target;
  };

  Entity.prototype.addOrigin = function (id, predicate, origin) {
    if (this.origins[id]) {
      return;
    }

    this.predicates[id] = predicate;
    this.origins[id] = origin;
  };

  Entity.prototype.getLabel = function () {
    var graphNameRegexp = new RegExp(app.config.default_graph_name + '?(.*)', 'i');

    var splittedValue = graphNameRegexp.exec(this.tuple.value);
    if (!splittedValue) return this.tuple.value;

    var label = splittedValue[splittedValue.length - 1];

    label = label.replace(/_/g, ' ');
    return label;
  };

  Entity.prototype.isCompleted = function () {
    return this.completed;
  };

  if (app) {
    Entity.prototype.isLiteral = function () {
      if (!this.type || !app.Storage.NodeType.has(this.type)) return false;

      return app.Storage.NodeType.get(this.type).rdfType === 'literal';
    };
    Entity.prototype.getType = function (){
      return app.Storage.NodeType.get(this.type);
    };

    app.models.Entity = Entity;
  } else {
    Entity.prototype.isLiteral = function () {
      return this.type === 'literal';
    };
    module.exports = Entity;
  }
})((typeof(window) !== 'undefined') ? window.app : null);
