/**
 * Entities Controller
 * Handles all logic about entities
 *
 * Created by Nikita Grishin on 08.2015
 */

'use strict';

(function (app, Socket, Storage, Entity, NodeType) {
  var scope = app.EntityController = {};

  Storage.Entity = new Storage('Entity');

  scope.variables = new Storage('Variables');

  /**
   * Open the Entity view page
   *
   * @param  {Function} callback to be called when the Entity view is completely open
   */
  scope.open = function (cb) {
    if (!scope.inited) {
      app.views.Entity.init();
      app.views.Entity.registerListener('onClickQuery', scope.onQueryClick);
      scope.inited = true;
    }
    if (cb) cb();
    return;
  };

  /**
   * Handle the query. Called when clicked on query button
   *
   * @param  {string} sending query to server and handling the response
   */
  scope.onQueryClick = function (query) {
    var task = app.StatusController.createTask('EntityController', 'Executing query', true);
    app.StatusController.addTask(task);

    Socket.query(query, function (result) {
      Storage.Entity.destroy();
      Storage.Entity = new Storage('Entity');

      scope.variables.destroy();
      scope.variables = new Storage('Variables');

      scope.updateEntities(result);

      app.views.Entity.updateVariables(scope.variables.getArray());
      app.views.Entity.update(query, scope.onResourceClick);
      app.StatusController.completeTask(task);
    });
  };

  /**
   * Updating stored entities by those received from the server
   *
   * @param  {object} the RDF query result
   */
  scope.updateEntities = function (result) {
    var vars = result.head.vars;
    var data = result.results.bindings;

    for (var d = 0; d < data.length; d++) {
      for (var v = 0; v < vars.length; v++) {
        var binding = data[d];
        var variable = vars[v];

        var resource = binding[variable];
        if (!resource) continue;

        if (!scope.selectedVaraible) {
          scope.selectedVaraible = {
            label: variable,
            count: 0
          };
        }
        if (!scope.variables.has(variable)) {
          scope.variables.set(variable, {
            label: variable,
            count: 0
          });
        }

        var entityId = objectHash(resource.value);
        var entityType = (resource.type === 'literal') ? 'literal' : null;
        var type = NodeType.update(entityType);

        var entity;

        if (Storage.Entity.has(entityId)) {
          entity = Storage.Entity.get(entityId);
          if (!entity.hasType(type.rdfType)) entity.types.push(type);
        } else {
          entity = new Entity(entityId, resource, [type], variable);
          Storage.Entity.set(entity.id, entity);
          scope.variables.get(variable).count++;
        }
      }
    }
  };

  /**
   * @param  {Entity} entity that was described
   * @param  {Array} array of entities that describes the given entity
   */
  scope.onEntityDescribed = function (entity, entities) {
    for (var i = 0; i < entities.length; i++) {
      var ent = entities[i];
      ent.type = NodeType.update(ent.type);

      if (ent.id === entity.id) {
        entity.objects = ent.objects;
        entity.predicates = ent.predicates;
        entity.origins = ent.origins;
        entity.type = ent.type;

        entity.updateAllConnections();
      } else {
        ent = Entity.castFromObject(ent);
        Storage.Entity.set(ent.id, ent);
      }
    }
  };

  /**
   * @param  {Object} an entity to be shown (an object with entity id or entity tuple)
   * @param  {Task} a task that should be done when the entity is shown
   */
  scope.show = function (params, task) {
    if (!scope.inited) scope.open();

    var entityId;
    if (params.id) entityId = params.id;
    else entityId = objectHash(params.tuple);

    var entity = app.Storage.Entity.get(entityId);

    if (!entity) {
      if (!params.tuple) return app.dom.showError('Entity not found: ' + params.id);

      entity = new app.models.Entity(entityId, params.tuple);
      app.Storage.Entity.set(entity.id, entity);
    }

    if (entity.isCompleted()) {
      app.StatusController.completeTask(task);
      return app.views.Entity.modal.show(entity);
    }

    app.Socket.describeEntity(entity, function (data) {
      var entities = data.entities;
      var originEntity = data.originEntity;

      var types = [];
      for (var i = 0 ; i < originEntity.types.length; i++) {
        types.push(NodeType.update(originEntity.types[i]));
      }

      entity.types = types;

      app.EntityController.onEntityDescribed(entity, entities);
      entity.completed = true;
      if (task) app.StatusController.completeTask(task);
      app.views.Entity.modal.show(entity);
    });
  };

  scope.onResourceClick = function (id) {
    return function () {
      var task = app.StatusController.createTask('EntityController', 'Describing entity');
      scope.show({id: id}, task);
    };
  };
})(window.app, window.app.Socket, window.app.Storage, window.app.models.Entity, window.app.models.NodeType);
