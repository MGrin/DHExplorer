'use strict';

(function (app) {
  console.log('Config script loaded');
  app.config = {
    graph: {
      maxUpdateNodesCount: 20,
      maxNodesCount: 500
    },
    doubleClickTimeout: 400
  };
})(window.app);