'use strict';
var _ = require('underscore');
var sparql = require('sparql');
var hash = require('object-hash');

var Entity = require('../../public/js/models/Entity.model');
var Edge = require('../../public/js/models/Edge.model');

var app;

var constructFromDescribe = function (originEntity, description) {
  var data = description.results.bindings;

  var entities = [];

  _.each(data, function (binding) {
    var subject = binding.s;
    var predicate = binding.p;
    var object = binding.o;

    var type;
    var entity;
    var edgeId;

    // Case where the described resource is in the object field
    if (object.value === originEntity.tuple.value) {
      type = (subject.type === 'literal') ? 'literal' : null;
      entity = new Entity(hash(subject.value), subject, type);

      edgeId = Edge.generateId(hash(subject.value), originEntity.id, predicate.value, hash);
      Entity.prototype.addOrigin.call(originEntity, edgeId, predicate, entity.id);
      return;
    }

    if (predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
      originEntity.type = object.value;
      return;
    }

    type = (object.type === 'literal') ? 'literal' : null;
    entity = new Entity(hash(object.value), object, type);

    entities.push(entity);

    edgeId = Edge.generateId(originEntity.id, entity.id, predicate, hash);

    Entity.prototype.addRelation.call(originEntity, edgeId, predicate, entity.id);
    entity.addOrigin(edgeId, predicate, originEntity.id);
  });

  entities.unshift(originEntity);
  return entities;
};

exports.init = function (myApp) {
  app = myApp;
};

exports.query = function (socket) {
  return function (message) {
    var messageId = message.id;

    var query = message.query;
    var endpoint = new sparql.Client(message.sparql);

    app.logger.info('req:query, ' + query);

    endpoint.query(query, function (err, result) {
      if (err) return socket.emit('res:err', err[2] || 'Virtuoso is not running');

      var resMessage = {
        id: messageId,
        data: result
      };
      socket.emit('res:' + messageId, resMessage);
    });
  };
};

exports.describe = function (socket) {
  return function (message) {
    var entity = message.data.entity;
    var endpoint = new sparql.Client(message.data.sparql);

    app.logger.info('req:entity:describe, ' + entity.id);

    var messageId = message.id;

    var query = 'describe <' + entity.tuple.value + '>';

    endpoint.query(query, function (err, result) {
      if (err) return socket.emit('res:err', err[2] || 'Virtuoso is not running');
      var entities = constructFromDescribe(entity, result);

      message = {
        id: messageId,
        data: entities
      };
      socket.emit('res:' + messageId, message);
    });
  };
};
