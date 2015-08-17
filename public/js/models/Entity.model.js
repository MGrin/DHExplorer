'use strict';

(function (app) {
  var Entity = function (id, tuple, type, variable) {
    this.id = id;
    this.tuple = tuple;
    this.type = type || 'no-type';
    this.variable = variable;

    this.predicates = {};
    this.subjects = {};
    this.origins = {};

    this.completed = this.isLiteral();
  };

  Entity.castFromObject = function (obj) {
    var entity = new Entity(obj.id, obj.tuple, obj.type);
    entity.predicates = obj.predicates;
    entity.subjects = obj.subjects;
    entity.origins = obj.origins;

    entity.updateAllConnections();
    return entity;
  };

  Entity.prototype.updateAllConnections = function () {
    for (var predIdx in this.predicates) {
      if (this.predicates[predIdx]) {
        var entityId = this.origins[predIdx] || this.subjects[predIdx];
        var connectionType = this.origins[predIdx] ? 'subject' : 'origin';

        var entity = app.Storage.Entity.get(entityId);
        if (!entity) continue;

        if (entity.predicates[predIdx]) continue;
        entity.predicates[predIdx] = this.predicates[predIdx];

        if (connectionType === 'subject' && entity.subjects[predIdx]) continue;
        if (connectionType === 'origin' && entity.origins[predIdx]) continue;

        if (connectionType === 'subject') {
          entity.subjects[predIdx] = this.id;
        } else {
          entity.origins[predIdx] = this.id;
        }
      }
    }
  };

  Entity.prototype.originsAsArray = function () {
    var arr = [];
    for (var originIdx in this.origins) {
      if (this.origins[originIdx]) {
        var origPredicate = this.predicates[originIdx];
        var source = app.Storage.Entity.get(this.origins[originIdx]);

        if (!source) continue;

        arr.push({
          predicate: origPredicate,
          source: source
        });
      }
    }

    return arr;
  };

  Entity.prototype.subjectsAsArray = function () {
    var arr = [];
    for (var subjectIds in this.subjects) {
      if (this.subjects[subjectIds]) {
        var subjPredicate = this.predicates[subjectIds];
        var subject = app.Storage.Entity.get(this.subjects[subjectIds]);

        if (!subject) continue;

        arr.push({
          predicate: subjPredicate,
          object: subject
        });
      }
    }

    return arr;
  };

  Entity.prototype.addRelation = function (id, predicate, target) {
    if (this.predicates[id] || this.subjects[id]) {
      return;
    }

    this.predicates[id] = predicate;
    this.subjects[id] = target;
  };

  Entity.prototype.addOrigin = function (id, predicate, origin) {
    if (this.origins[id]) {
      return;
    }

    this.predicates[id] = predicate;
    this.origins[id] = origin;
  };

  Entity.prototype.getLabel = function () {
    var graphNameRegexp = new RegExp(app.QueryController.graphName + '?(.*)', 'i');

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
    app.models.Entity = Entity;
  } else {
    Entity.prototype.isLiteral = function () {
      return this.type === 'literal';
    };
    module.exports = Entity;
  }
})((typeof(window) !== 'undefined') ? window.app : null);
