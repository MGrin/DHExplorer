/**
 * Entity viewmodel
 * Handling all processes needed to visualise elements related to Entity
 *
 * Created by Nikita Grishin on 08.2015
 */

'use strict';

(function (app) {
  var scope = app.views.Entity = {};

  scope.listeners = {};
  scope.registerListener = function (event, fn) {
    if (!scope.listeners[event]) scope.listeners[event] = [];
    scope.listeners[event].push(fn);
  };
  scope.emit = function (event, data) {
    if (!scope.listeners[event]) return;
    for (var i = 0; i < scope.listeners[event].length; i++) {
      scope.listeners[event][i](data);
    }
  };

  scope.computeNumberOfPages = function (perPage, predicate) {
    return Math.ceil(app.Storage.Entity.getArray(null, null, predicate).length / perPage);
  };

  scope.init = function (cb) {
    // Rendering the list of entities in the query view
    scope.list = ReactDOM.render(
      <app.React.EntitiesList />,
      $('#entity-container .entities-list').get(0)
    );
    scope.list.setState({
      page: 0,
      entitiesPerPage: scope.entitiesPerPage,
      predicate: scope.predicate
    });

    // Rendering the list of variables in query
    scope.variables = ReactDOM.render(
      <app.React.QueryVariablesMenu />,
      $('#entity-container .query .variables').get(0)
    );

    // Getting an instance of entity modal window
    scope.modal = app.React.EntityModal.getInstance();

    $('#entity-container .tabular.menu .item').tab();
    $('#entity-container .query form').submit(function (e) {
      e.preventDefault();
      var query = $('#entity-container .query form textarea').val();
      if (!query || query === '') return;

      scope.emit('onClickQuery', query);
    });

    $('#entity-container .search').search({
      apiSettings: {
        url: '/search/person?q={query}&endpoint=' + app.config.default_sparql_endpoint
      },
      onSelect: function (result) {
        app.EntityController.show({
          tuple: result.tuple
        });
      }
    });
  };

  scope.update = function (query, onResourceClickCb) {
    scope.list.setState({
      query: query,
      page: 0,
      entitiesPerPage: 30,
      onResourceClick: onResourceClickCb
    });
  };

  scope.updateVariables = function (vars) {
    scope.predicate = function (entity) {
      return entity.variable && entity.variable === vars[0].label;
    };
    var numberOfPages = scope.computeNumberOfPages(30, scope.predicate);

    scope.list.setState({
      numberOfPages: numberOfPages,
      predicate: scope.predicate
    });

    scope.variables.setState({
      variables: vars,
      onClick: function (v) {
        return function () {
          $('.variables .variable').each(function () {
            $(this).removeClass('active');
          });
          $('.variables .' + v.label).each(function () {
            $(this).addClass('active');
          });
          scope.predicate = function (entity) {
            return entity.variable && entity.variable === v.label;
          };
          scope.list.setState({
            numberOfPages: scope.computeNumberOfPages(30, scope.predicate),
            predicate: scope.predicate
          });
        };
      }
    });
  };

  scope.showPreviousEntity = function () {
    scope.history.pop()
    scope.setModalEntity(scope.history.pop());
  };
})(window.app);
