'use strict';

(function (app) {
  var scope = app.StatisticsController = {};
  console.log('Statistics controller loaded');

  scope.animationOut = 'slide right';
  scope.animationIn = 'slide left';

  scope.inited = {};

  scope.open = function (cb) {
    return scope.switchView(scope.view || 'dashboard', cb);
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
        break;
      }
      case 'ContractsPerYear': {
        app.views.Statistics.showContractsPerYear(data);
        break;
      }
      case 'ContractsPerRegister' : {
        app.views.Statistics.showContractsPerRegister(data);
        break;
      }
      case 'FoliaPerYear': {
        app.views.Statistics.showFoliaPerYear(data);
        break;
      }
      case 'FoliaPerRegister': {
        app.views.Statistics.showFoliaPerRegister(data);
        break;
      }
    }
  };

  scope.switchView = function (newView, cb) {
    if (scope.view === newView) return cb();

    scope.view = newView;
    if (scope.domview) {
      scope.domview.transition(scope.animationOut, function () {
        scope.domview = $('#statistics-' + newView);
        scope.domview.transition(scope.animationIn);
      });
      
    } else {
      scope.domview = $('#statistics-' + newView);
    }
    scope.domview.removeClass('hide');

    if (!scope.inited[newView]) {
      app.views.Statistics.init(newView);
      scope.inited[newView] = true;
      scope.compute(newView, function () {
        if (cb) cb();
      });
    } else {
      if (cb) cb();
    }
  };

  scope.compute = function (view, cb) {
    scope.task = app.StatusController.createTask('StatisticsController', 'Computing statistics...', true);
    app.StatusController.addTask(scope.task);

    app.Socket.requestStatistics(view, function () {
      if (cb) cb();
      app.StatusController.completeTask(scope.task);
    },scope.handlersFactory, function () {
        
    });
  };

  scope.sectionClick = function (el, section) {
    return function () {
      scope.switchView(section, function () {
        $('#bottom-menu .statistics-selection').removeClass('active');
        el.addClass('active');
      });
    };
  };
})(window.app);