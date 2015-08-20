'use strict';

(function (app, Socket) {
  var scope = app.GraphController = {};

  scope.loadGraph = function () {
    Socket.requestSocialGraph(0, 2000, function (data) {
      console.log(data);
    });
  };

  scope.open = function (cb) {
    if (!scope.inited) scope.init();
    if (scope.inited) app.views.Graph.resume();

    if (cb) cb();
    return;
  };

  scope.close = function () {
    app.views.Graph.pause();
  };

  scope.init = function () {
    scope.inited = true;
    app.views.Graph.registerListener('onNodeClick', scope.onNodeClick);

    var task = app.StatusController.createTask('GraphController', 'Loading social graph...', true);
    app.StatusController.addTask(task);

    Socket.requestSocialGraph(1550, 1585, function (data) {
      var nodes = [];
      var edges = [];

      for (var n in data.nodes) {
        if (data.nodes[n]) {
          nodes.push(data.nodes[n]);
        }
      }

      for (var e in data.edges) {
        if (data.edges[e]) {
          edges.push(e);
        }
      }

      console.log(nodes.length, edges.length);

      app.views.Graph.update(nodes, edges);
      app.StatusController.completeTask(task);
    });
  };

  scope.onNodeClick = function (node) {
    var task = app.StatusController.createTask('GraphController', 'Describing node...');

    app.EntityController.show({
      id: node.id,
      tuple: node.entity
    }, task);
  };


})(window.app, window.app.Socket);
