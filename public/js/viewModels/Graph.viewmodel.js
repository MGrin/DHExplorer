'use strict';

(function (app) {
  var scope = app.views.Graph = {};

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

  scope.render = function () {
    scope.graphics = Viva.Graph.View.webglGraphics();
    scope.events = Viva.Graph.webglInputEvents(scope.graphics, scope.graph);
    scope.events.click(function (node) {
      scope.emit('onNodeClick', node.data);
    });

    scope.NodeShader = new app.WebGL.NodeShader();
    scope.graphics.setNodeProgram(scope.NodeShader);

    scope.graphics.node(function (node) {
      return new app.WebGL.models.Circle(node);
    });

    scope.layout = Viva.Graph.Layout.forceDirected(scope.graph, {
      springLength: 30,
      springCoeff: 0.0008,
      gravity: -1,
      theta: 0.8,
      dragCoeff: 0.02,
      timeStep: 20
    });

    scope.renderer = Viva.Graph.View.renderer(scope.graph, {
      container: $('#graph-container').get(0),
      graphics: scope.graphics,
      layout: scope.layout
    });
    scope.renderer.run();
  };

  scope.pause = function () {
    if (scope.renderer) scope.renderer.pause();
  };

  scope.resume = function () {
    if (scope.renderer) scope.renderer.resume();
  };

  scope.update = function (nodes, edges) {
    if (scope.renderer) scope.renderer.dispose();
    scope.graph = Viva.Graph.graph();
    var i;

    for (i = 0; i < nodes.length; i++) {
      scope.graph.addNode(nodes[i].id, nodes[i]);
    }

    for (i = 0; i < edges.length; i++) {
      var source = edges[i].split('-')[0];
      var target = edges[i].split('-')[1];

      scope.graph.addLink(source, target);
    }

    scope.render();
  };
})(window.app);
