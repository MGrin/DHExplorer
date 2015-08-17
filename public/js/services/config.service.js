'use strict';

(function (app) {
  app.env = 'production';

  app.config = {
    graph: {
      maxUpdateNodesCount: 20,
      maxNodesCount: 500
    },
    default_sparql_endpoint: (app.env === 'production') ? 'http://128.178.21.39:8890' : 'http://localhost:8890/sparql',
    default_graph_name: (app.env === 'production') ? 'http://128.178.21.39:8080/garzoni-data/' : 'http://localhost:8080/garzoni-data/',
    default_query: 'select ?person ?contract where {?person a grz-owl:PersonMention . ?contract a grz-owl:Contract}'
  };
})(window.app);
