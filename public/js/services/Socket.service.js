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

  Socket.requestStatistics = function (view, initCb, cbFactory, finalCb) {
    var message = {
      id: generateMessageId(),
      sparql: app.config.default_sparql_endpoint
    };

    Socket.io.emit('req:statistics:' + view, message);
    Socket.io.on('res:' + message.id, function (resMessage) {
      if (resMessage.status === 'initial') return initCb(resMessage.data);

      if (resMessage.status === 'final') {
        Socket.io.removeListener('res:' + resMessage.id);
        return finalCb(resMessage.data);
      }

      return cbFactory(resMessage.status, resMessage.data);
    });
  };

  Socket.requestHistogramPerMonthesForYear = function (year, type, cb) {
    type = type.toLowerCase();

    var message = {
      id: generateMessageId(),
      sparql: app.config.default_sparql_endpoint,
      year: year
    };

    var path = 'req:statistics:' + type + ':year';
    Socket.io.emit(path, message);
    Socket.io.on('res:' + message.id, function (resMessage) {
      Socket.io.removeListener('res:' + resMessage.id);
      return cb(resMessage.data);
    });
  };

  Socket.requestHistogramPerDayForMonth = function (year, month, type, cb) {
    type = type.toLowerCase();

    var message = {
      id: generateMessageId(),
      sparql: app.config.default_sparql_endpoint,
      year: year,
      month: month
    };

    var path = 'req:statistics:' + type + ':month';
    Socket.io.emit(path, message);
    Socket.io.on('res:' + message.id, function (resMessage) {
      Socket.io.removeListener('res:' + resMessage.id);
      return cb(resMessage.data);
    });
  };

  var generateMessageId = function () {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  };
})(window.app);
