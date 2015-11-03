'use strict';

module.exports = function (app) {
  var graph = app.controllers.Graph;
  var entity = app.controllers.Entity;
  var statistics = app.controllers.Statistics;

  var handleSocketConnection = function (socket) {
    socket.on('req:query', entity.query(socket));
    socket.on('req:entity:describe', entity.describe(socket));

    socket.on('req:timerange', graph.timerange(socket));
    socket.on('req:graph:social', graph.social.query(socket));

    socket.on('req:statistics:query', statistics.query(socket));

    socket.on('disconnect', function () {

    });
  };

  app.io.on('connection', handleSocketConnection);
};
