'use strict';
var _ = require('underscore');
var sparql = require('sparql');
var hash = require('object-hash');
var async = require('async');
var queries = require('../queries');

var GraphNode = require('../../public/js/models/Node.model');

var app;

exports.init = function (myApp) {
  app = myApp;
};

var social = {};

social.query = function (socket) {
  return function (message) {
    var messageId = message.id;

    var endpoint = new sparql.Client(message.sparql);
    var minYear = message.data.minYear;
    var maxYear = message.data.maxYear;

    app.logger.info('req:graph:social, ' + minYear + ', ' + maxYear);

    endpoint.query(queries.generateSocialGraphQuery(minYear, maxYear), function (err, result) {
      if (err) return socket.emit('res:err', err[2] || 'Virtuoso is not running');

      var persons = {};
      var conections = {};

      var data = result.results.bindings;

      for (var i = 0; i < data.length; i++) {
        var binding = data[i];

        var person = binding.person;
        var plabel = binding.plabel.value;

        var connection = binding.connection;
        var clabel = binding.clabel.value;

        if (!plabel || !clabel || !person || !connection) continue;

        var pid = hash(person);
        var cid = hash(connection);

        if (!persons[pid]) persons[pid] = new GraphNode(pid, person, {label: plabel});
        if (!persons[cid]) persons[cid] = new GraphNode(cid, connection, {label: clabel});

        var edgeId = [pid, cid].sort().join('-');
        if (!conections[edgeId]) conections[edgeId] = 'knows';
      }

      var resMessage = {
        id: messageId,
        data: {
          nodes: persons,
          edges: conections
        }
      };

      socket.emit('res:' + messageId, resMessage);
    });
  };
};
exports.social = social;
