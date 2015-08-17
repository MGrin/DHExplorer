'use strict';

(function (app, Socket, Storage) {
  var scope = app.GraphController = {};

  scope.onDomReady = function () {
    console.log('Graph controller onDomReady callback called');

    scope.NodesStorage = new Storage('Node');
    scope.graph = new app.models.Graph();

    scope.init();

    $('.top-menu #expand-nodes').click(scope.expandAllNodes);
    $('.top-menu #clear-graph').click(function () {
      scope.clearGraph();
      scope.d3.update();
    });
  };

  scope.loadGraph = function () {
    if (app.offline) return;

    scope.task = app.StatusController.createTask('GraphController', 'Connecting graph...', app.dom.view === 'graph');
    app.StatusController.addTask(scope.task);
    Socket.requestGraph();
    scope.onOpen = null;
  };

  app.QueryController.registerListener(function () {
    if (app.dom.view === 'graph') {
      scope.loadGraph();
    } else {
      scope.onOpen = scope.loadGraph;
    }
  });

  Socket.registerGlobalListener('res:graph', function (graph) {
    scope.clearGraph();
    scope.d3.update();
    scope.appendSubgraph(graph);

    scope.expandAllNodes(function () {
      app.StatusController.completeTask(scope.task);
    });
  });

  scope.open = function (cb) {
    if (scope.onOpen) scope.onOpen();
    if (cb) cb();
    return;
  };

  scope.appendSubgraph = function (graph, sourceNode) {
    scope.updateGraph(graph, sourceNode);
    scope.d3.update();
  };

  scope.clearGraph = function () {
    scope.graph.clear();
  };

  scope.updateGraph = function (graph, sourceNode) {
    var nodes = graph.nodes;
    var edges = graph.edges;

    if (sourceNode) sourceNode.fixed = true;
    var addedNodes = 0;
    var i;
    for (i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (!scope.isInteresting(node)) continue;

      node.type = app.models.NodeType.update(node.type);
      if (sourceNode) {
        node.x = sourceNode.x;
        node.y = sourceNode.y;
      }

      scope.updateEntityWithNode(node);

      if (!scope.NodesStorage.has(node.id)) {
        scope.NodesStorage.set(node.id, node);
        addedNodes++;
      }

      if (addedNodes < app.config.graph.maxUpdateNodesCount && scope.graph.nodes.length < app.config.graph.maxNodesCount) scope.graph.addNode(node);
    }

    for (i = 0; i < edges.length; i++) {
      var edge = edges[i];
      scope.graph.addEdge(edge);
    }

    // app.StatusController.completeTask(task);
  };

  scope.isInteresting = function (node) {
    var type = node.getType ? node.getType().label : node.type;

    return (type !== 'literal');
  };

  // scope.constructGraphFromEntity = function (sourceNode, entity) {
  //   var graph = {
  //     nodes: [],
  //     edges: []
  //   };

  //   for (var predIdx in entity.predicates) {
  //     if (entity.predicates[predIdx]) {
  //       var predicate = entity.predicates[predIdx];
  //       var subject = entity.subjects[predIdx];
  //       if (!subject) continue;

  //       var nodeEntity = Storage.Entity.get(subject);

  //       var node = Node.createFromEntity(nodeEntity);

  //       var edgeId = Edge.generateId(entity.id, node.id, predicate, objectHash);
  //       var edge = new Edge(edgeId, sourceNode.id, node.id, predicate);

  //       graph.nodes.push(node);
  //       graph.edges.push(edge);
  //     }
  //   }

  //   sourceNode.type = entity.type;
  //   graph.nodes.unshift(sourceNode);
  //   return graph;
  // };

  scope.updateEntityWithNode = function (node) {
    var entity;

    if (Storage.Entity.has(node.id)) {
      entity = Storage.Entity.get(node.id);
      if (entity.type === 'no-type' && node.type !== entity.type) entity.type = node.type;
    } else {
      entity = new app.models.Entity(node.id, node.data, node.type, node.variable);
      Storage.Entity.set(entity.id, entity);
    }
  };

  scope.init = function () {
    var d3params = {
      width: app.dom.graph.width(),
      height: app.dom.graph.height(),
      charge: -4000,
      friction: 0.8,
      linkDistance: 50,
      domId: '#graph-container'
    };

    scope.d3 = app.views.D3Graph.init(scope.graph, d3params);

    scope.d3.registerListener('computeNodeCircleOpacity', scope.computeNodeCircleOpacity);

    scope.d3.registerListener('computeNodeLabelOpacity', scope.computeNodeLabelOpacity);

    scope.d3.registerListener('computeRadius', scope.computeRadius);

    scope.d3.registerListener('computeEdgeOpacity', scope.computeEdgeOpacity);

    scope.d3.registerListener('fillNode', scope.fillNode);

    scope.d3.registerListener('node-click', scope.nodeClick);
    scope.d3.registerListener('node-shift-click', scope.nodeShiftClick);
    scope.d3.registerListener('node-mouseenter', scope.nodeMouseEnter);
    scope.d3.registerListener('node-mouseout', scope.nodeMouseOut);
    scope.d3.registerListener('node-label', scope.getNodeLabel);
    scope.d3.registerListener('node-icon', scope.getNodeIcon);
  };

  scope.expandAllNodes = function (cb) {
    var task = app.StatusController.createTask('GraphController', 'Expanding graph...');
    app.StatusController.addTask(task);

    var nodes = scope.graph.nodes;
    Socket.describeNodes(nodes, function (graph) {
      scope.appendSubgraph(graph);
      app.StatusController.completeTask(task);
      if (cb && typeof(cb) === 'function') return cb();
    });
  };

  scope.computeNodeCircleOpacity = function (node) {
    if (!node.isVisible()) return 0;

    return 0.8;
  };

  scope.computeNodeLabelOpacity = function (node) {
    if (!node.isVisible()) return 0;
    return 1;
  };

  scope.computeRadius = function (node) {
    if (!node.isVisible()) return 0;

    return 20;
  };

  scope.computeEdgeOpacity = function (edge) {
    if (!edge.source.isVisible() || !edge.target.isVisible()) return 0;
    return 1;
  };

  scope.fillNode = function (node) {
    return node.getType().color;
  };

  scope.nodeClick = function (node) {
    var task = app.StatusController.createTask('GraphController', 'Describing node...');
    app.StatusController.addTask(task);

    var entity = Storage.Entity.get(node.id);
    if (entity.isCompleted()) {
      app.StatusController.completeTask(task);
      return app.dom.showEntityModal(entity);
    }

    Socket.describeEntity(entity, function (entities) {
      app.EntityController.onEntityDescribed(entity, entities);
      app.dom.showEntityModal(Storage.Entity.get(node.id));
      node.type = entity.type;
      app.StatusController.completeTask(task);
    });
  };

  scope.nodeShiftClick = function (node) {
    Socket.describeNode(node, function (graph) {
      scope.appendSubgraph(graph, node);
    });
  };

  scope.nodeMouseOut = function (node) {

  };

  scope.nodeMouseEnter = function (node) {

  };

  scope.getNodeLabel = function (node) {
    return node.getLabel();
  };

  scope.getNodeIcon = function (node) {
    return '<i class="' + node.getType().getIconClass() + '"></i>';
  };

  scope.toggleTypeVisibility = function (type) {
    scope.d3.tick();
  };
})(window.app, window.app.Socket, window.app.Storage, window.app.models.NodeType, window.app.models.Node, window.app.models.Edge);

window.app.addOnDocumentReady('GraphController', window.app.GraphController.onDomReady, ['DomController']);
