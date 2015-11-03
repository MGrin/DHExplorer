'use strict';
/**
 * Graph controller
 *
 * Created by Nikita Grishin on 08.2015
 */
var hash = require('object-hash');
var queries = require('../queries');

/**
 * Node model, the same for frontend and backend
 * @type {Model}
 */
var GraphNode = require('../../public/js/models/Node.model');

var app;

exports.init = function (myApp) {
  app = myApp;
};

/**
 * Handles the request of the timerange, available in the database
 *
 * @param  {socket} a socket object to send the response
 * @return {Function} a handler function
 */
exports.timerange = function (socket) {
  /**
   * @param  {Object} a request message. Should contain a message @id will be used to send the response
   * @return {Null}
   */
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

/**
 * Handles the request for a social graph for provided parameters, passed in message
 * @param  {socket} a socket object to send the response
 * @return {Function} a handler function
 */
social.query = function (socket) {
  /**
   * @param  {Object} a request message. Should contain:
   *                                      * @id will be used to send the response
   *                                      * @data containing minYear and maxYear describing the request time window
   * @return {Null}
   */
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

        // If at least one field is mising, we do not append the current binding to the result
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

        // id of an entity is just the hash of the entity
        var pid = hash(person);
        var cid = hash(connection);

        // Constructing new Graph node if not existing yet
        if (!persons[pid]) persons[pid] = new GraphNode(pid, person, {
                                                                      label: plabel,
                                                                      gender: pgender
                                                                    });
        // Constructing new Graph node if not existing yet
        if (!persons[cid]) persons[cid] = new GraphNode(cid, connection, {
                                                                          label: clabel,
                                                                          gender: cgender
                                                                        });

        // an Edge id is composed of two entities ids, sorted and joined with '-'
        // The sorting is used to preseve equality for two edges between same nodes but in the different direction
        // So doing sort we lose the information about edge direction
        var edgeId = [pid, cid].sort().join('-');
        // And here is the directional insformation preserved
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

