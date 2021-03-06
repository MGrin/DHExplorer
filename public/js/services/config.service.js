/**
* An Config service.
*
* Created by Nikita Grishin on 08.2015
*/

'use strict';

(function (app) {
  if (typeof(Chart) !== 'undefined') Chart.defaults.global.responsive = true;

  app.config = {
    graph: {
      initMinYear: 1641,
      initMaxYear: 1643
    },
    entity: {
      perPage: 30,
    },
    default_sparql_endpoint: (app.env === 'production') ? 'http://128.178.21.22:8890/sparql' : 'http://localhost:8890/sparql',
    default_graph_name: (app.env === 'production') ? 'http://128.178.21.22:8080/garzoni-data/' : 'http://localhost:8080/garzoni-data/',
    default_query: 'select ?person ?contract where {?person a grz-owl:PersonMention . ?contract a grz-owl:Contract}'
  };

  return app.config;

})(typeof(window) !== 'undefined' ? window.app : {});
