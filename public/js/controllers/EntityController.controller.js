'use strict';

(function (app, Socket, Storage, Entity, NodeType) {
  var scope = app.EntityController = {};

  Storage.Entity = new Storage('Entity');

  scope.variables = new Storage('Variables');

  scope.open = function (cb) {
    if (!scope.inited) {
      app.views.Entity.init();
      app.views.Entity.registerListener('onClickQuery', scope.onQueryClick);
      scope.inited = true;
    }
    if (cb) cb();
    return;
  };

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
        var entityType = (resource.type === 'literal') ? 'literal' : 'no-type';
        var type = NodeType.update(entityType);

        var entity;

        if (Storage.Entity.has(entityId)) {
          entity = Storage.Entity.get(entityId);
          if (entity.type === 'no-type' && type !== entity.type) entity.type = type;
        } else {
          entity = new Entity(entityId, resource, type, variable);
          Storage.Entity.set(entity.id, entity);
          scope.variables.get(variable).count++;
        }
      }
    }
  };

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

    app.Socket.describeEntity(entity, function (entities) {
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
