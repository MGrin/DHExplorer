/**
* An Socket model.
* Used to communicate with the server through sockets
*
* Created by Nikita Grishin on 08.2015
*/

'use strict';

(function (app) {
  var Socket = app.Socket = {};

  Socket.globalListeners = {};

  Socket.io = io();

  Socket.io.on('disconnect', function () {
    app.StatusController.showError('Server offline');
    app.offline = true;
  });
  Socket.io.on('connect', function () {
    if (app.dom) app.dom.hideError();
    app.offline = false;
  });

  /**
   * @param  {string} event name
   * @param  {Function} function to be called when the event occurs
   */
  Socket.registerGlobalListener = function (event, listener) {
    if (!Socket.globalListeners[event]) {
      Socket.globalListeners[event] = [];
      Socket.io.on(event, function (message) {
        for (var i = 0; i < Socket.globalListeners[event].length; i++) {
          Socket.globalListeners[event][i](message);
        }
      });
    }

    Socket.globalListeners[event].push(listener);
  };

  // Following functions are realisations of server communications for diffent parts of the application

  Socket.requestTimeRange = function (cb) {
    var message = {
      id: generateMessageId(),
      sparql: app.config.default_sparql_endpoint
    };

    Socket.io.emit('req:timerange', message);
    Socket.io.on('res:' + message.id, function (resMessage) {
      Socket.io.removeListener('res:' + resMessage.id);
      cb(resMessage.data);
    });
  };

  Socket.requestSocialGraph = function (minYear, maxYear, cb) {
    var message = {
      id: generateMessageId(),
      sparql: app.config.default_sparql_endpoint,
      data: {
        minYear: minYear,
        maxYear: maxYear,
      }
    };

    Socket.io.emit('req:graph:social', message);
    Socket.io.on('res:' + message.id, function (resMessage) {
      Socket.io.removeListener('res:' + resMessage.id);
      cb(resMessage.data);
    });
  };

  Socket.describeEntity = function (entity, cb) {
    var message = {
      id: generateMessageId(),
      data: {
        entity: entity,
        sparql: app.config.default_sparql_endpoint
      }
    };

    Socket.io.emit('req:entity:describe', message);
    Socket.io.on('res:' + message.id, function (resMessage) {
      Socket.io.removeListener('res:' + resMessage.id);
      cb(resMessage.data);
    });
  };

  Socket.query = function (query, cb) {
    var message = {
      id: generateMessageId(),
      query: query,
      sparql: app.config.default_sparql_endpoint
    };

    Socket.io.emit('req:query', message);
    Socket.io.on('res:' + message.id, function (resMessage) {
      Socket.io.removeListener('res:' + resMessage.id);
      cb(resMessage.data);
    });
  };

  Socket.statisticsQuery = function (query, cb) {
    var message = {
      id: generateMessageId(),
      query: query,
      sparql: app.config.default_sparql_endpoint
    };

    Socket.io.emit('req:statistics:query', message);
    Socket.io.on('res:' + message.id, function (resMessage) {
      Socket.io.removeListener('res:' + resMessage.id);
      cb(resMessage.data);
    });
  };

  // Easy and hacky random generator. =)
  // TODO
  // Assuming this will generate unique values. But certenaly should be changed to something more stable
  var generateMessageId = function () {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  };
})(window.app);
