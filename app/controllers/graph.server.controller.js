'use strict';
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

    app.logger.info('req:timerange');
    app.sparql.query(queries.TIMERANGE, function (err, result) {
      if (err) return app.err(err, socket);

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

    var minYear = message.data.minYear;
    var maxYear = message.data.maxYear;

    app.logger.info('req:graph:social, ' + minYear + ', ' + maxYear);

    app.sparql.query(queries.generateSocialGraphQuery(minYear, maxYear), function (err, result) {
      if (err) return app.err(err, socket);

      var persons = {};
      var conections = {};

      var data = result.results.bindings;

      for (var i = 0; i < data.length; i++) {
        var binding = data[i];
        var person, relationType, relation, connection, plabel, pgender, clabel, cgender;

        if (!binding.person
              || !binding.plabel
              || !binding.pgender
              || !binding.connection
              || !binding.clabel
              || !binding.cgender
              || !binding.relation
              || !binding.relationType) continue;

        person = binding.person;
        plabel = binding.plabel.value;
        pgender = binding.pgender.value;

        connection = binding.connection;
        clabel = binding.clabel.value;
        cgender = binding.cgender.value;

        relation = binding.relation.value;
        relationType = binding.relationType.value;

        var pid = hash(person);
        var cid = hash(connection);

        if (!persons[pid]) persons[pid] = new GraphNode(pid, person, {
                                                                      label: plabel,
                                                                      gender: pgender
                                                                    });
        if (!persons[cid]) persons[cid] = new GraphNode(cid, connection, {
                                                                          label: clabel,
                                                                          gender: cgender
                                                                        });

        var edgeId = [pid, cid].sort().join('-');
        var directionId = [pid, cid].join('-');

        if (!conections[edgeId]) conections[edgeId] = {};
        if (!conections[edgeId][directionId]) conections[edgeId][directionId] = {};
        if (!conections[edgeId][directionId][relationType]) conections[edgeId][directionId][relationType] = relation;
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

