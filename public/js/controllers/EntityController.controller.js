'use strict';

(function (app, Socket, Storage, Entity, NodeType) {
  var scope = app.EntityController = {};
  console.log('Entity controller loaded');

  Storage.Entity = new Storage('Entity');

  scope.onDomReady = function () {
    app.views.Entity.open();
  };

  scope.loadEntities = function () {
    if (app.offline) return;
    
    scope.task = app.StatusController.createTask('EntityController', 'Executing query...', app.dom.view === 'entity');
    app.StatusController.addTask(scope.task);
    Socket.query();
    scope.onOpen = null;
  };

  app.QueryController.registerListener(function () {
    if (app.dom.view === 'entity') {
      scope.loadEntities();
    } else {
      scope.onOpen = scope.loadEntities;
    }
  });

  Socket.registerGlobalListener('res:query', function (result) {
    scope.updateEntities(result);
    app.views.Entity.update();

    app.StatusController.completeTask(scope.task);
  });

  scope.open = function (cb) {
    if (scope.onOpen) scope.onOpen();
    if (cb) cb();
    return;
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
        }
      }
    }
  };

  scope.onEntityDescribed = function (entity, entities) {
    for (var i = 0; i < entities.length; i++) {
      var ent = entities[i];
      ent.type = NodeType.update(ent.type);

      if (ent.id === entity.id) {
        entity.subjects = ent.subjects;
        entity.predicates = ent.predicates;
        entity.origins = ent.origins;
        entity.type = ent.type;
        
        entity.completed = true;
        entity.updateAllConnections();
      } else {
        ent = Entity.castFromObject(ent);
        Storage.Entity.set(ent.id, ent);
      }
    }
  };

  scope.getView = function (entity) {
    return scope.entity.getHTML(entity);
  };

  scope.getViewLabel = function (entity) {
    return scope.entity.getLabelHTML(entity);
  };

  scope.onResourceClick = function (id) {
    return function () {
      var task = app.StatusController.createTask('EntityController', 'Describing entity');
      app.StatusController.addTask(task);

      var entity = Storage.Entity.get(id);

      if (!entity) {
        app.StatusController.completeTask(task);
        return console.log('No entity found for id ' + id);
      }

      if (entity.isCompleted()) {
        app.StatusController.completeTask(task);

        return app.dom.showEntityModal(entity);
      }

      app.dom.showDimmer('Loading');

      Socket.describeEntity(entity, function (entities) {
        scope.onEntityDescribed(entity, entities);
        entity.completed = true;
        app.StatusController.completeTask(task);

        return app.dom.showEntityModal(entity);
      });
    };    
  };
})(window.app, window.app.Socket, window.app.Storage, window.app.models.Entity, window.app.models.NodeType);

window.app.addOnDocumentReady('EntityController', window.app.EntityController.onDomReady, ['DomController']);