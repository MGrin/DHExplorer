'use strict';

(function (app, NodeType) {
  var scope = app.LegendController = {};

  scope.onDomReady = function () {
    console.log('Legend controller onDomReady callback called');

    scope.legend = app.views.Legend.init();

    scope.legend.registerListener('legend-click', scope.onLegendClick);
  };

  scope.onLegendClick = function (type) {
    type.isVisible = !type.isVisible;
    app.GraphController.toggleTypeVisibility();
  };

  scope.addNewType = function (type) {
    scope.legend.appendType(type);
  };
})(window.app, window.app.models.NodeType);

window.app.addOnDocumentReady('LegendController', window.app.LegendController.onDomReady, []);
