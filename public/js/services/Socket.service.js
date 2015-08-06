'use strict';

(function (app) {
  var Socket = app.Socket = {};
  console.log('Socket service loaded');

  Socket.globalListeners = {};

  Socket.io = io();

  Socket.io.on('disconnect', function () {
    app.StatusController.showError('Server offline');
    app.offline = true;
  });
  Socket.io.on('connect', function () {
    app.dom.hideError();
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
  Socket.registerGlobalListener('res:statistics', function () {
    var index = Socket.running.indexOf('statistics');
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

  Socket.requestStatistics = function (initCb, cbFactory, finalCb) {
    var message = {
      id: generateMessageId(),
      sparql: app.QueryController.sparql
    };

    Socket.io.emit('req:statistics', message);
    Socket.io.on('res:' + message.id, function (resMessage) {
      // console.log(resMessage);
      
      if (resMessage.status === 'initial') return initCb(resMessage.data);

      if (resMessage.status === 'final') {
        Socket.io.removeListener('res:' + resMessage.id);
        return finalCb(resMessage.data);
      }

      return cbFactory(resMessage.status, resMessage.data);
    });
  };

  Socket.requestStatisticsOnQuery = function () {
    var message = {
      query: app.QueryController.query,
      sparql: app.QueryController.sparql,
      graphName: app.QueryController.graphName
    };

    Socket.running.push('statistics');
    Socket.io.emit('req:statistics:query', message);
  };

  var generateMessageId = function () {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  };
})(window.app);