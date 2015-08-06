'use strict';

(function (app, Socket) {
  var scope = app.QueryController = {};
  console.log('Query controller loaded');

  // scope.sparql = 'http://128.178.21.39:8890';
  scope.sparql = 'http://localhost:8890/sparql';
  // scope.graphName = 'http://128.178.21.39:8080/garzoni-data/';
  scope.graphName = 'http://localhost:8080/garzoni-data/';

  scope.query = 'select ?person ?contract where {?person a grz-owl:PersonMention . ?contract a grz-owl:Contract}';

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