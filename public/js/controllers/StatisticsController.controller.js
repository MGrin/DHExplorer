'use strict';

(function (app) {
  var scope = app.StatisticsController = {};

  scope.animationOut = 'slide right';
  scope.animationIn = 'slide left';

  scope.inited = {};

  scope.open = function (cb) {
    return scope.switchView(scope.view || 'dashboard', cb);
  };

  scope.handlersFactory = function (status, data) {
    // console.log(status, data);
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

      case 'ArchivesOverview': {
        app.views.Statistics.Archives.Overview.setData(data);
        break;
      }
      case 'ContractsPerYear': {
        app.views.Statistics.Archives.Contracts.PerYear.setData(data);
        break;
      }
      case 'ContractsPerRegister' : {
        app.views.Statistics.Archives.Contracts.PerRegister.setData(data);
        break;
      }
      case 'FoliaPerYear': {
        app.views.Statistics.Archives.Folia.PerYear.setData(data);
        break;
      }
      case 'FoliaPerRegister': {
        app.views.Statistics.Archives.Folia.PerRegister.setData(data);
        break;
      }

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

  scope.onPersonBarClick = function (tuple) {
    var task = app.StatusController.createTask('StatisticsController', 'Describing person', true);
    app.StatusController.addTask(task);

    var entityId = objectHash(tuple.value);
    var entity = app.Storage.Entity.get(entityId);
    if (!entity) {
      entity = new app.models.Entity(entityId, tuple);
      app.Storage.Entity.set(entity.id, entity);
    }

    if (entity.isCompleted()) {
      app.StatusController.completeTask(task);
      return app.dom.showEntityModal(entity);
    }

    app.Socket.describeEntity(entity, function (entities) {
      app.EntityController.onEntityDescribed(entity, entities);
      app.dom.showEntityModal(app.Storage.Entity.get(entityId));
      app.StatusController.completeTask(task);
    });
  };
  app.views.Statistics.registerListener('onPersonBarClick', scope.onPersonBarClick);

  scope.onYearBarClick = function (year) {
    var task = app.StatusController.createTask('StatisticsController', 'Expanding year');
    app.StatusController.addTask(task);

    app.Socket.requestHistogramPerMonthesForYear(year, function (data) {
      app.views.Statistics.Archives.Contracts.PerYear
        .setTitle('Contracts per month for year ' + year)
        .setData(data);
      app.StatusController.completeTask(task);
    });
  };
  app.views.Statistics.registerListener('onYearBarClick', scope.onYearBarClick);
})(window.app);
