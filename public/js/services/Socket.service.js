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

  Socket.describeNode = function (node, cb) {
    var message = {
      id: generateMessageId(),
      data: {
        node: node,
        sparql: app.QueryController.sparql
      }
    };
    Socket.io.emit('req:node:describe', message);
    Socket.io.on('res:' + message.id, function (resMessage) {
      Socket.io.removeListener('res:' + resMessage.id);
      cb(resMessage.data);
    });
  };

  Socket.describeNodes = function (nodes, cb) {
    var message = {
      id: generateMessageId(),
      data: {
        nodes: nodes,
        sparql: app.QueryController.sparql
      }
    };

    Socket.io.emit('req:node:describe:multiple', message);
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
        sparql: app.QueryController.sparql
      }
    };

    Socket.io.emit('req:entity:describe', message);
    Socket.io.on('res:' + message.id, function (resMessage) {
      Socket.io.removeListener('res:' + resMessage.id);
      cb(resMessage.data);
    });
  };


  Socket.running = [];
  Socket.registerGlobalListener('res:query', function () {
    var index = Socket.running.indexOf('entity');
    if (index > -1) Socket.running.splice(index, 1);
  });
  Socket.registerGlobalListener('res:graph', function () {
    var index = Socket.running.indexOf('graph');
    if (index > -1) Socket.running.splice(index, 1);
  });

  Socket.query = function () {
    var message = {
      query: app.QueryController.query,
      sparql: app.QueryController.sparql
    };

    Socket.running.push('entity');
    Socket.io.emit('req:query', message);
  };

  Socket.requestGraph = function () {
    var message = {
      query: app.QueryController.query,
      sparql: app.QueryController.sparql
    };

    Socket.running.push('graph');
    Socket.io.emit('req:graph', message);
  };

  Socket.requestStatistics = function (view, initCb, cbFactory, finalCb) {
    var message = {
      id: generateMessageId(),
      sparql: app.QueryController.sparql
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

  Socket.requestHistogramPerMonthesForYear = function (year, cb) {
    var message = {
      id: generateMessageId(),
      sparql: app.QueryController.sparql,
      year: year
    };

    Socket.io.emit('req:statistics:contracts:year', message);
    Socket.io.on('res:' + message.id, function (resMessage) {
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
