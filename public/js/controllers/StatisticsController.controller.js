'use strict';

(function (app) {
  var scope = app.StatisticsController = {};

  scope.animationOut = 'slide right';
  scope.animationIn = 'slide left';

  scope.inited = {};

  scope.open = function (cb) {
    return scope.switchView(scope.view || 'dashboard', cb);
  };

  scope.handlersFactory = {
    dashboard: function (status, data) {
      switch (status) {
        case 'GraphOverview': {
          app.views.Statistics.Dashboard.Overview.setData(data);
          break;
        }
        case 'ClassesOverview': {
          app.views.Statistics.Dashboard.Classes.setData(data);
          break;
        }
        case 'PropertiesOverview': {
          app.views.Statistics.Dashboard.Properties.setData(data);
          break;
        }
      }
    },
    archives: function (status, data) {
      switch (status) {
        case 'ArchivesOverview': {
          app.views.Statistics.Archives.Overview.setData(data);
          break;
        }
        case 'ContractsPerYear': {
          app.views.Statistics.Archives.Contracts.PerDate.setData(data);
          break;
        }
        case 'ContractsPerRegister' : {
          app.views.Statistics.Archives.Contracts.PerRegister.setData(data);
          break;
        }
        case 'FoliaPerYear': {
          app.views.Statistics.Archives.Folia.PerDate.setData(data);
          break;
        }
        case 'FoliaPerRegister': {
          app.views.Statistics.Archives.Folia.PerRegister.setData(data);
          break;
        }
      }
    },
    people: function (status, data) {
      switch (status) {
        case 'PeopleOverview': {
          app.views.Statistics.People.Overview.setData(data);
          break;
        }
        case 'RolesPerPersonMention': {
          app.views.Statistics.People.Roles.setData(data);
          break;
        }
        case 'PersonMentionPerEntity': {
          app.views.Statistics.People.Mentions.setData(data);
          break;
        }
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
    },scope.handlersFactory[view], function () {

    });
  };

  scope.sectionClick = function (el, section) {
    return function () {
      scope.switchView(section, function () {
        $('.bottom-menu .statistics-selection').removeClass('active');
        el.addClass('active');
      });
    };
  };

  scope.onPersonBarClick = function (tuple) {
    var task = app.StatusController.createTask('StatisticsController', 'Describing person', false);
    app.EntityController.show({tuple: tuple}, task);
  };
  app.views.Statistics.registerListener('onPersonBarClick', scope.onPersonBarClick);

  scope.onYearBarClick = function (data) {
    var ReactComponent = data.info.source;
    var type = data.info.type;
    var yearPoint = data.point;

    var year = yearPoint.label.value;
    var task = app.StatusController.createTask('StatisticsController', 'Expanding year');
    app.StatusController.addTask(task);

    app.Socket.requestHistogramPerMonthesForYear(year, data.info.type, function (data) {
      ReactComponent
        .saveCurrentState()
        .setTitle(type + ' per month for year ' + year)
        .setProperty('year', year)
        .setListener('onBarClick', app.React.helpers.onBarClick('onMonthBarClick', app.views.Statistics.emit, {source: ReactComponent, year: year, type: type}))
        .setFilter('label-transform', app.React.helpers.monthNumberToString)
        .setData(data);

      app.StatusController.completeTask(task);
    });
  };
  app.views.Statistics.registerListener('onYearBarClick', scope.onYearBarClick);

  scope.onMonthBarClick = function (data) {
    var ReactComponent = data.info.source;
    var type = data.info.type;

    var monthPoint = data.point;
    var info = data.info;

    var month = monthPoint.label.number;
    var year = info.year;

    var task = app.StatusController.createTask('StatisticsController', 'Expanding month');
    app.StatusController.addTask(task);

    var chartConfig = $.extend(true, {}, app.views.Statistics.Archives.Contracts.PerDate.state.chartConfig);
    chartConfig.scale = null;

    app.Socket.requestHistogramPerDayForMonth(year, month, data.info.type, function (data) {
      ReactComponent
        .saveCurrentState()
        .setTitle(type + ' per day for ' + monthPoint.label.value + ' ' + year)
        .setProperty('month', month)
        .setListener('onBarClick', app.React.helpers.noop)
        .setFilter('label-transform', null)
        .setChartConfig(chartConfig)
        .setData(data);

      app.StatusController.completeTask(task);
    });
  };
  app.views.Statistics.registerListener('onMonthBarClick', scope.onMonthBarClick);
})(window.app);
