'use strict';

(function (app) {
  var scope = app.views.Entity = {};

  scope.predicate = function (entity) {
    return entity.variable ? true : false;
  };
  scope.init = function (cb) {
    if (!scope.list) {
      scope.list = React.render(
        <app.React.EntitiesList />,
        $('#entity-container .row .column').get(0)
      );
    }
    return cb();
  };

  scope.update = function () {
    scope.list.setState({
      page: 0,
      entities: app.Storage.Entity.getArray(entitiesPerPage, 0, entityPredicate)
    });
  };

  scope.history = [];

  scope.setModalEntity = function (entity) {
    if (!scope.entityModal) {
      scope.entityModal = React.render(
        <app.React.EntityModal />,
        $('#entity-modal-container').get(0)
      );
    }

    if (scope.history.length === 0 || scope.history[scope.history.length - 1].id !== entity.id) scope.history.push(entity);

    scope.entityModal.setState({
      entity: entity
    });
  };

  scope.showPreviousEntity = function () {
    scope.history.pop()
    scope.setModalEntity(scope.history.pop());
  };
})(window.app);
