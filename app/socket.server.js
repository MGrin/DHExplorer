'use strict';

module.exports = function (app) {
  var graph = app.controllers.Graph;
  var entity = app.controllers.Entity;
  var statistics = app.controllers.Statistics;

  var handleSocketConnection = function (socket) {
    socket.on('req:query', entity.query(socket));
    socket.on('req:entity:describe', entity.describe(socket));

    socket.on('req:node:describe', graph.describeNode(socket));
    socket.on('req:node:describe:multiple', graph.describeNodes(socket));

    socket.on('req:statistics:dashboard', statistics.computeDashboard(socket));
    socket.on('req:statistics:archives', statistics.computeArchives(socket));
    socket.on('req:statistics:people', statistics.computePeople(socket));

    socket.on('req:statistics:contracts:year', statistics.histogram.contractsForYear(socket));
    socket.on('req:statistics:contracts:month', statistics.histogram.contractsForMonth(socket));

    socket.on('req:statistics:folia:year', statistics.histogram.foliaForYear(socket));
    socket.on('req:statistics:folia:month', statistics.histogram.foliaForMonth(socket));
    // socket.on('req:statistics:query', statistics.computeOnQuery(socket));

    socket.on('req:graph', graph.query(socket));

    socket.on('disconnect', function () {

    });
  };

  app.io.on('connection', handleSocketConnection);
};
