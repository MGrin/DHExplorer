'use strict';

(function (app) {
  var scope = app.StatisticsController = {};
  console.log('Statistics controller loaded');

  scope.open = function (cb) {
    if (scope.computed) return app.views.Statistics.showDashboard(cb);

    scope.task = app.StatusController.createTask('StatisticsController', 'Computing statistics...', app.dom.view === 'statistics');
    app.StatusController.addTask(scope.task);

    app.Socket.requestStatistics(function () {
      if (cb) cb();
      app.views.Statistics.init();
      app.StatusController.completeTask(scope.task);
    }, scope.handlersFactory, function () {
      scope.computed = true;
    });
  };

  scope.handlersFactory = function (status, data) {
    console.log(status, data);
    switch (status) {
      case 'GraphOverview': {
        app.views.Statistics.showGraphOverview(data);
        break;
      }
      case 'ClassesOverview': {
        app.views.Statistics.showClassesOverview(data);
        break;
      }
      case 'PropertiesOverview': {
        app.views.Statistics.showPropertiesOverview(data);
      }
    }
  };
})(window.app);

// (function (app) {
//   var scope = app.StatisticsController = {};
//   console.log('Statistics controller loaded');

//   scope.loadStatistics = function () {
//     if (app.offline) return;
    
//     scope.task = app.StatusController.createTask('GraphController', 'Computing statistics...', app.dom.view === 'statistics');
//     app.StatusController.addTask(scope.task);
//     app.Socket.requestStatisticsOnQuery();
//     scope.onOpen = null;
//   };

//   app.QueryController.registerListener(function () {
//     if (app.dom.view === 'statistics') {
//       scope.loadStatistics();
//     } else {
//       scope.onOpen = scope.loadStatistics;
//     }
//   });

//   app.Socket.registerGlobalListener('res:statistics', function (stats) {
//     app.views.Statistics.update(stats, function () {
//       app.StatusController.completeTask(scope.task);
//     });
//   });

//   scope.open = function (cb) {
//     if (scope.onOpen) scope.onOpen();
//     if (cb) cb();
//     return;
//   };

// })(window.app, window.app.models.NodeType);