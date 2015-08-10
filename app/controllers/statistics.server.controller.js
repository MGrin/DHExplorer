'use strict';

var sparql = require('sparql');
var async = require('async');
var _ = require('underscore');

var queries = require('../queries');
var app;

exports.init = function (myApp) {
  app = myApp;
};

exports.compute = function (socket) {
  return function (message) {
    var messageId = message.id;
    var endpoint = new sparql.Client(message.sparql);

    var fireResponse = function (status, data) {
      var msg = {
        id: messageId,
        status: status,
        data: data
      };

      socket.emit('res:' + msg.id, msg);
    };

    fireResponse('initial');

    var graphOverview = {};
    var classesOverview = {};
    var propertiesOverview = {};

    async.parallel([
      function (next) {
        endpoint.query(queries.GRAPH_OVERVIEW, function (err, result) {
          if (err) return next(err[2] || 'Virtuoso is not running');

          var data = result.results.bindings;
          // var vars = result.head.vars;

          _.each(data, function (d) {
            graphOverview[d.graphName ? d.graphName.value : 'Default graph'] = _.mapObject(
              _.omit(d, 'graphName'), function (el) {
                return el.value;
              }
            );
          });
          fireResponse('GraphOverview', graphOverview);
          return next();
        });
      },
      function (next) {
        endpoint.query(queries.CLASSES_OVERVIEW, function (err, result) {
          if (err) return next(err[2] || 'Virtuoso is not running');

          var data = result.results.bindings;
          // var vars = result.head.vars;

          _.each(data, function (d) {
            classesOverview[d.class.value] = {
              value: d.count.value
            };
          });

          fireResponse('ClassesOverview', classesOverview);
          return next();
        });
      },
      function (next) {
        endpoint.query(queries.PROPERTIES_OVERVIEW, function (err, result) {
          if (err) return next(err[2] || 'Virtuoso is not running');

          var data = result.results.bindings;
          // var vars = result.head.vars;

          _.each(data, function (d) {
            propertiesOverview[d.property.value] = {
              value: d.count.value
            };
          });
          fireResponse('PropertiesOverview', propertiesOverview);
          return next();
        });
      }
    ], function (err) {
      if (err) return socket.emit('res:err', err);
      return fireResponse('final');
    });
  };
};

exports.computeOnQuery = function (socket) {
  return function (message) {
    var query = message.query;
    var endpoint = new sparql.Client(message.sparql);
    var graphName = message.graphName;

    var describeQueries = [];
    var stats;
    var descriptions = [];

    var done = function (data) {
      return socket.emit('res:statistics', data);
    };

    var datasetSize = 0;

    async.series([
      function (next) {
        endpoint.query(query, function (err, result) {
          if (err) return socket.emit('res:err', err[2] || 'Virtuoso is not running');

          var vars = result.head.vars;
          var data = result.results.bindings;
          datasetSize = data.length;

          if (data.length === 0) return done({
            length: 0
          });

          var queryCount = 0;
          var numberPerQuery = 500;

          for (var d = 0; d < data.length; d++) {
            if (d % numberPerQuery === 0) {
              queryCount++;
              describeQueries[queryCount-1] = 'describe ';
            }
            for (var v = 0; v < vars.length; v++) {
              var binding = data[d];
              var variable = vars[v];

              var resource = binding[variable];
              if (!resource) continue;
              if (resource.type !== 'uri') continue;

              describeQueries[queryCount-1] += '<' + resource.value + '> ';
            }
          }

          return next();
        });
      }, function (next) {
        var parallelTasks = [];
        _.each(describeQueries, function (describeQuery, queryIndex) {
          if (describeQuery === 'describe ') return;

          parallelTasks.push(function (_next) {
            endpoint.query(describeQuery, function (err, result) {
              if (err) {
                console.log(describeQuery);
                return _next(queryIndex + ': ' + (err[2] || 'Virtuoso is not running'));
              }

              if (!result) console.log('No result for query ' + queryIndex);
              if (!result.head) console.log('No head for query ' + queryIndex);
              if (!result.results) console.log('No result.results for query ' + queryIndex);

              descriptions = descriptions.concat(result.results.bindings);

              return _next();
            });
          });
        });
      
        async.parallel(parallelTasks, function (err) {
          return next(err);
        });
      }, function (next) {
        stats = {
          types: {
            chartType: 'PolarArea',
            label: 'Entity types',
            data: {}
          },
          predicates: {
            chartType: 'BarPlot',
            label: 'Relations histogram',
            data: {}
          },
          overview: [{
            label: 'Dataset size',
            value: datasetSize
          }]
        };

        for (var i = 0; i < descriptions.length; i++) {
          var description = descriptions[i];

          var subject = description.s;
          var predicate = description.p;
          var object = description.o;

          var relation = transformLabel(predicate.value, '#');
          if (!stats.predicates.data[relation]) stats.predicates.data[relation] = 0;
          stats.predicates.data[relation]++;

          if (predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
            var type = object.value;

            if (!stats.types.data[type]) stats.types.data[type] = 0;
            stats.types.data[type]++;
          }
        }

        return next();
      }
    ], function (err) {
      if (err) return socket.emit('res:err', err);
      return done(stats);
    });
  };
};

var transformLabel = function (l, s) {
  var lsplit = l.split(s);
  return lsplit[lsplit.length - 1];
};