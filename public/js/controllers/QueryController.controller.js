'use strict';

(function (app, Socket) {
  var scope = app.QueryController = {};

  scope.sparql = app.config.default_sparql_endpoint;
  scope.graphName = app.config.default_graph_name;
  scope.query = app.config.default_query;

  scope.listeners = [];
  scope.registerListener = function (cb) {
    scope.listeners.push(cb);
  };
  scope.notify = function () {
    for (var i = 0; i < scope.listeners.length; i++) {
      scope.listeners[i]();
    }
  };

  scope.onDomLoaded = function () {
    console.log('Query controller onDomLoaded callback called');
    $('#query-btn').click(function () {
      scope.query = $('#query-input').val();
      scope.notify();
    });
  };
})(window.app, window.app.Socket);

window.app.addOnDocumentReady('QueryController', window.app.QueryController.onDomLoaded, ['DomController']);
