/**
 * Graph Controller
 * Handles all logic about graph
 *
 * Created by Nikita Grishin on 08.2015
 */

'use strict';

(function (app, Socket) {
  var scope = app.GraphController = {};
  scope.setup = {};

  /**
   * Open the graph view
   *
   * @param  {Function} callback function
   */
  scope.open = function (cb) {
    if (!scope.inited) scope.init();
    if (scope.inited && scope.changedAnimation) {
      app.views.Graph.resume();
    }

    if (cb) cb();
    return;
  };

  /**
   * Close the graph view, stops the graph if needed
   */
  scope.close = function () {
    if (!app.views.Graph.paused) {
      app.views.Graph.pause();
      scope.changedAnimation = true;
    } else {
      scope.changedAnimation = false;
    }
  };

  /**
   * Is called when user changes the timerange
   *
   * @param  {object} new time range
   * @return {[type]}
   */
  scope.onTimeRangeUpdate = function (data) {
    scope.setup.minYear = data.minYear;
    scope.setup.maxYear = data.maxYear;

    var task = app.StatusController.createTask('GraphController', 'Loading social graph...', true);
    app.StatusController.addTask(task);


    Socket.requestSocialGraph(scope.setup.minYear, scope.setup.maxYear, function (data) {
      var nodes = [];
      var edges = [];

      var males = 0;
      var females = 0;

      for (var n in data.nodes) {
        if (data.nodes[n]) {
          nodes.push(data.nodes[n]);

          if (data.nodes[n].data.gender === 'M') males++;
          else females++;
        }
      }

      for (var e in data.edges) {
        if (data.edges[e]) {
          edges.push({id: e, value: data.edges[e]});
        }
      }

      app.views.Graph.update(nodes, edges);
      app.views.Graph.updateInformation({
        nodesCount: nodes.length,
        maleCount: males,
        femaleCount: females,

        edgesCount: edges.length
      });
      app.StatusController.completeTask(task);
    });
  };

  scope.init = function () {
    scope.inited = true;

    app.views.Graph.registerListener('onNodeClick', scope.onNodeClick);
    app.views.Graph.registerListener('onTimeRangeUpdate', scope.onTimeRangeUpdate);

    Socket.requestTimeRange(function (data) {
      var params = {
        min: data.minYear,
        max: data.maxYear,
        from: scope.setup.minYear,
        to: scope.setup.maxYear
      };
      app.views.Graph.init(params);
    });

    scope.onTimeRangeUpdate({
      minYear: app.config.graph.initMinYear,
      maxYear: app.config.graph.initMaxYear
    });
  };

  scope.onNodeClick = function (node) {
    var task = app.StatusController.createTask('GraphController', 'Describing node...');

    app.EntityController.show({
      id: node.id,
      tuple: node.entity
    }, task);
  };


})(window.app, window.app.Socket);
