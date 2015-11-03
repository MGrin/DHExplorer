'use strict';

(function (app) {
  var scope = app.StatisticsController = {};

  scope.open = function (cb) {
    return scope.switchView(scope.view || 'archives', cb);
  };

  scope.switchView = function (newView, cb) {
    if (scope.view === newView) return cb();
    scope.view = newView;
    app.views.Statistics.show(scope.view);
    cb();
  };

  scope.sectionClick = function (el, section) {
    return function () {
      scope.switchView(section, function () {
        $('.bottom-menu .statistics-selection').removeClass('active');
        el.addClass('active');
      });
    };
  };

  scope.showEntity = function (tuple) {
    var task = app.StatusController.createTask('StatisticsController', 'Describing person', false);
    app.EntityController.show({tuple: tuple}, task);
  };

})(window.app);
