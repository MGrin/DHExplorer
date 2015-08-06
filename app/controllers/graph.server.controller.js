'use strict';
var _ = require('underscore');
var sparql = require('sparql');
var hash = require('object-hash');
var async = require('async');

var _Node = require('../../public/js/models/Node.model');
var Edge = require('../../public/js/models/Edge.model');

var app;

var constructFromDescribe = function (origNode, description) {
  var data = description.results.bindings;
  
  var graph = {
    nodes: [],
    edges: []
  };

  _.each(data, function (binding) {
    // Described result, so variables are only s(ubject), p(redicate) and o(bject)
    var pred = binding.p;
    var obj = binding.o;
    
    // Case where the described resource is in object field
    if (obj.value === origNode.data.value) {
      return;
    }

    // Getting the type of node
    if (pred.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
      origNode.type = obj.value;
      return;
    }

    var nodeObject = new _Node(hash(obj.value), obj, 'no-type');
    if (obj.type === 'literal') {
      nodeObject.type = obj.type;
    }

    graph.nodes.push(nodeObject);

    var edgeId = Edge.generateId(origNode.id, nodeObject.id, pred.value, hash);
    var edge = new Edge(edgeId, origNode.id, nodeObject.id, pred);

    graph.edges.push(edge);
  });
  graph.nodes.unshift(origNode);

  return graph;
};

// TODO make it clever!!
exports.constructFromQuery = function (result) {
  var graph = {
    nodes: [],
    edges: []
  };

  var graphMap = {};

  var vars = result.head.vars;
  var data = result.results.bindings;

  var addedNodes = 0;

  graphLoop: for (var d = 0; d < data.length; d++) {
    for (var v = 0; v < vars.length; v++) {
      var binding = data[d];
      var variable = vars[v];
      if (!binding || !variable) continue;

      var resource = binding[variable];
      if (!resource) continue;

      var nodeId = hash(resource.value);
      var nodeType = (resource.type === 'literal') ? 'literal' : 'no-type';

      if (graphMap[nodeId]) continue;
      if (nodeType === 'literal') continue;
      
      var node = new _Node(nodeId, resource, nodeType);
      node.variable = variable;

      graphMap[nodeId] = node;

      graph.nodes.push(node);
      addedNodes++;
      if (addedNodes > 15) break graphLoop;
    }
  }

  return graph;
};

exports.init = function (myApp) {
  app = myApp;
};

exports.describeNode = function (socket) {
  return function (message) {
    var node = message.data.node;
    var endpoint = new sparql.Client(message.data.sparql);

    app.logger.info('req:node:describe, ' + node.id);

    var messageId = message.id;

    var query = 'describe <' + node.data.value + '>';

    endpoint.query(query, function (err, result) {
          if (err) return socket.emit('res:err', err[2] || 'Virtuoso is not running');
          var describedNodeGraph = constructFromDescribe(node, result);
          message = {
            id: messageId,
            data: describedNodeGraph
          };
          socket.emit('res:' + messageId, message);
        });
  };
};

exports.describeNodes = function (socket) {
  return function (message) {
    var nodes = message.data.nodes;
    var endpoint = new sparql.Client(message.data.sparql);

    app.logger.info('req:node:describe:multiple, ' + nodes.length);

    var messageId = message.id;

    var graph = {
      nodes: [],
      edges: []
    };

    var parallelTasks = [];
    // UGLY HACK!!!
    _.each(nodes, function (node) {
      var query = 'describe <' + node.data.value + '>';

      parallelTasks.push(function (next) {
        endpoint.query(query, function (err, result) {
          if (err) return next(err);
          var describedNodeGraph = constructFromDescribe(node, result);
          if (describedNodeGraph.nodes.length > 15) describedNodeGraph.nodes = describedNodeGraph.nodes.slice(0, 15);
          
          graph.nodes = graph.nodes.concat(describedNodeGraph.nodes);
          graph.edges = graph.edges.concat(describedNodeGraph.edges);
          return next();
        });
      });
    });

    async.parallel(parallelTasks, function (err) {
      if (err) return socket.emit('res:err', err[2] || 'Virtuoso is not running');
      message = {
        id: messageId,
        data: graph
      };
      socket.emit('res:' + messageId, message);
    });
  };
};

exports.query = function (socket) {
  return function (message) {
    var query = message.query;
    var endpoint = new sparql.Client(message.sparql);

    app.logger.info('req:graph, ' + query);

    endpoint.query(query, function (err, result) {
      if (err) return socket.emit('res:err', err[2] || 'Virtuoso is not running');
      var graph = app.controllers.Graph.constructFromQuery(result);
      socket.emit('res:graph', graph);
    });
  };
};