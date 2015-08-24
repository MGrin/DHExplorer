'use strict';
var sparql = require('sparql');
var hash = require('object-hash');
var queries = require('../queries');

var GraphNode = require('../../public/js/models/Node.model');

var app;

exports.init = function (myApp) {
  app = myApp;
};

exports.timerange = function (socket) {
  return function (message) {
    var messageId = message.id;

    var endpoint = new sparql.Client(message.sparql);

    app.logger.info('req:timerange');
    endpoint.query(queries.TIMERANGE, function (err, result) {
      if (err) return socket.emit('res:err', err[2] || 'Virtuoso is not running');

      var data = result.results.bindings[0];
      var resMessage = {
        id: messageId,
        data: {
          minYear: data.min.value,
          maxYear: data.max.value
        }
      };

      socket.emit('res:' + messageId, resMessage);
    });
  };
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
        var pgender = binding.pgender.value;

        var connection = binding.connection;
        var clabel = binding.clabel.value;
        var cgender = binding.cgender.value;

        var ctype = binding.ctype.value;

        if (!plabel || !clabel || !person || !connection) continue;

        var pid = hash(person);
        var cid = hash(connection);

        if (!persons[pid]) persons[pid] = new GraphNode(pid, person, {label: plabel, gender: pgender});
        if (!persons[cid]) persons[cid] = new GraphNode(cid, connection, {label: clabel, gender: cgender});

        var edgeId = [pid, cid].sort().join('-');
        if (!conections[edgeId]) conections[edgeId] = [];
        if (conections[edgeId].indexOf(ctype) === -1) conections[edgeId].push(ctype);
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

