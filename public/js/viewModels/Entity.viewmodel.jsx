'use strict';

(function (app) {
  var scope = app.views.Entity = {};

  scope.open = function (cb) {
    scope.list = React.render(
      <EntitiesView />,
      app.dom.entity.get(0)
    );

    return;
  };

  scope.update = function () {
    if (!scope.list) {
      scope.list = React.render(
        <EntitiesView />,
        app.dom.entity.get(0)
      );
    }
    scope.list.setState({
      page: 0,
      entities: app.Storage.Entity.getArray(entitiesPerPage, 0, entityPredicate)
    });
  };

  scope.renderModalWindow = function () {
    scope.entityModal = {
      header: React.render(
                <EntityModalHeader />,
                $('#entity-modal .header').get(0)
              ),
      content: React.render(
                  <EntityModalContent />,
                  $('#entity-modal .content').get(0)
                )
    };
  };

  scope.history = [];

  scope.setModalEntity = function (entity) {
    if (!scope.entityModal) {
      scope.renderModalWindow();
    }

    if (scope.history.length === 0 || scope.history[scope.history.length - 1].id !== entity.id) scope.history.push(entity);

    scope.entityModal.header.setState({
      entity: entity
    });
    scope.entityModal.content.setState({
      entity: entity
    });
  };

  scope.showPreviousEntity = function () {
    scope.history.pop()
    scope.setModalEntity(scope.history.pop());
  };
})(window.app);
