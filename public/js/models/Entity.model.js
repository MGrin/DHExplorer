/**
* An Entity model.
*
* Created by Nikita Grishin on 08.2015
*/


'use strict';

(function (app) {
  /**
   * @param {string} an entity id
   * @param {object} a RDF tuple
   * @param {Array}  entity types
   * @param {string} a variable that were used to retrieve this entity
   */
  var Entity = function (id, tuple, types, variable) {
    this.id = id;
    this.tuple = tuple;
    this.types = types || [];

    this.variable = variable;

    this.predicates = {};
    this.objects = {};
    this.origins = {};

    this.completed = this.isLiteral();
  };

  /**
   * Casting the JSON object to Entity object
   * @param  {object} the JSON representation of entity
   * @return {Entity}
   */
  Entity.castFromObject = function (obj) {
    var entity = new Entity(obj.id, obj.tuple, obj.types);
    entity.predicates = obj.predicates;
    entity.objects = obj.objects;
    entity.origins = obj.origins;

    entity.updateAllConnections();
    return entity;
  };

  /**
   * Updating all connections of this entity
   */
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

  /**
   * Adding the relation to this entity. In the rdf triplet format: (this, predicate, target)
   *
   * @param {string} an relation id
   * @param {any} a realtion between this entity and an object entity
   * @param {object} an object entity
   */
  Entity.prototype.addRelation = function (id, predicate, target) {
    if (this.predicates[id] || this.objects[id]) {
      return;
    }

    this.predicates[id] = predicate;
    this.objects[id] = target;
  };

  /**
   * Adding the origin to this entity. In the rdf triplet format: (origin, predicate, this)
   *
   * @param {string} an relation id
   * @param {any} a realtion between this entity and an object entity
   * @param {object} an object entity
   */
  Entity.prototype.addOrigin = function (id, predicate, origin) {
    if (this.origins[id]) {
      return;
    }

    this.predicates[id] = predicate;
    this.origins[id] = origin;
  };

  /**
   * @return {string} a well formatted label of the entity
   */
  Entity.prototype.getLabel = function () {
    var graphNameRegexp = new RegExp(app.config.default_graph_name + '/?(.*)', 'i');

    var splittedValue = graphNameRegexp.exec(this.tuple.value);
    if (!splittedValue) return this.tuple.value;

    var label = splittedValue[splittedValue.length - 1];

    label = label.replace(/_/g, ' ');
    return label;
  };

  /**
   * @return {Boolean} true if the entity is described (and probably some other information)
   */
  Entity.prototype.isCompleted = function () {
    return this.completed;
  };

  if (app) {
    Entity.prototype.isLiteral = function () {
      if (!this.types || this.types.length === 0) return false;

      for (var i = 0 ; i < this.types.length; i++) {
        var type = this.types[i];
        if (app.Storage.NodeType.get(type) && app.Storage.NodeType.get(type).rdfType === 'literal') return true;
      }
      return false;
    };

    Entity.prototype.getTypes = function () {
      var res = [];
      for (var i = 0; i < this.types.length; i++) {
        if (app.Storage.NodeType.get(this.types[i]).label !== 'Not typed') res.push(app.Storage.NodeType.get(this.types[i]));
      }
      return res;
    };

    Entity.prototype.hasType = function (t) {
      for (var i = 0; i < this.types.length; i++) {
        var type = app.Storage.NodeType.get(this.types[i]);
        if (type.isEqual(t)) return true;
      }

      return false;
    };

    app.models.Entity = Entity;
  } else {
    Entity.prototype.isLiteral = function () {
      return this.types.indexOf('literal') !== -1;
    };
    module.exports = Entity;
  }
})((typeof(window) !== 'undefined') ? window.app : null);
