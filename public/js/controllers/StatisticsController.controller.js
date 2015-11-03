/**
 * Statistics Controller
 * Handles all logic about statistics charts
 *
 * Created by Nikita Grishin on 08.2015
 */

'use strict';

(function (app) {
  var scope = app.StatisticsController = {};

  /**
   * Open the Statistics view page
   *
   * @param  {Function} callback to be called when the Entity view is completely open
   */
  scope.open = function (cb) {
    return scope.switchView(scope.view || 'archives', cb);
  };

  /**
   * Switch the statistics view (archives, people, ...)
   * @param  {string} next view to be shown
   * @param  {Function} callback to call after complete view switch
   */
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

  /**
   * Shows an entity from the statistical view (some chart clicked)
   *
   * @param  {object} RDF Tuple to be shown
   */
  scope.showEntity = function (tuple) {
    var task = app.StatusController.createTask('StatisticsController', 'Describing person', false);
    app.EntityController.show({tuple: tuple}, task);
  };

})(window.app);
