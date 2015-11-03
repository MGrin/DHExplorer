'use strict';
/**
 * Entity controller
 *
 * Created by Nikita Grishin on 08.2015
 */
var _ = require('underscore');
var hash = require('object-hash');

/**
 * Entity model, the same on frontend and backend
 * @type {Model}
 */
var Entity = require('../../public/js/models/Entity.model');
/**
 * Edge model, the same on frontend and backend
 * @type {Model}
 */
var Edge = require('../../public/js/models/Edge.model');

var app;

exports.init = function (myApp) {
  app = myApp;
};

/**
 * @param  {Object} originEntity - an entity sent from the client. Can be an Entity object (already constructed) or an RDF tuple
 * @param  {Object} description - a result of the `describe` query
 * @return {Array} an array of entities that are related to the provided entity
 */
var constructFromDescribe = function (originEntity, description) {
  var data = description.results.bindings;

  var entities = [];

  // Going through all entity that comes on after the describe query
  _.each(data, function (binding) {
    // They are triplets in the from (subject, predicate, object).
    var subject = binding.s;
    var predicate = binding.p;
    var object = binding.o;

    var types = [];
    var entity;
    var edgeId;

    // Case where the described resource is in the object field
    if (object.value === originEntity.tuple.value) {
      types.push((subject.type === 'literal') ? 'literal' : null);
      entity = new Entity(hash(subject.value), subject, types);

      edgeId = Edge.generateId(hash(subject.value), originEntity.id, predicate.value, hash);
      Entity.prototype.addOrigin.call(originEntity, edgeId, predicate, entity.id);
      return;
    }

    // If the predicate is #type, the binding is an indicator of entity type
    if (predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
      if (!originEntity.types) originEntity.types = [];
      originEntity.types.push(object.value);
      return;
    }

    types.push((object.type === 'literal') ? 'literal' : null);
    entity = new Entity(hash(object.value), object, types);

    entities.push(entity);

    edgeId = Edge.generateId(originEntity.id, entity.id, predicate, hash);

    Entity.prototype.addRelation.call(originEntity, edgeId, predicate, entity.id);
    entity.addOrigin(edgeId, predicate, originEntity.id);
  });

  // Removing the provided entity from the list
  entities.unshift(originEntity);
  return entities;
};

/**
 * Handles the entity query request
 * @param  {socket} a socket object to send the response
 * @return {Function} a handler function
 */
exports.query = function (socket) {
  /**
   * @param  {Object} a request message. Should contain:
   *                                      * a message @id will be used to send the response
   *                                      * a database @query
   * @return {Null}
   */
  return function (message) {
    var messageId = message.id;
    var query = message.query;

    app.logger.info('req:query');

    app.sparql.query(query, function (err, result) {
      if (err) return app.err(err, socket);

      // Returning the result of the query as it is
      var resMessage = {
        id: messageId,
        data: result
      };

      socket.emit('res:' + messageId, resMessage);
    });
  };
};

/**
 * Handles the describe query for the given entity
 *
 * @param  {socket} a socket object to send the response
 * @return {Function} a handler function
 */
exports.describe = function (socket) {
  /**
   * @param  {Object} a request message. Should contain:
   *                                      * a message @id will be used to send the response
   *                                      * a @data containing @entity
   *                                      * @entity contains @id (the id of entity) and @tuple (the RDF tuple of the form (type, value))
   * @return {Null}
   */
  return function (message) {
    var entity = message.data.entity;

    app.logger.info('req:entity:describe, ' + entity.id);

    var messageId = message.id;

    var query = 'describe <' + entity.tuple.value + '>';

    app.sparql.query(query, function (err, result) {
      if (err) return app.err(err, socket);
      var entities = constructFromDescribe(entity, result);

      message = {
        id: messageId,
        data: {
          entities: entities,
          originEntity: entity
        }
      };
      socket.emit('res:' + messageId, message);
    });
  };
};
