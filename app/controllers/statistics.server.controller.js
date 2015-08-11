'use strict';

var sparql = require('sparql');
var async = require('async');
var _ = require('underscore');

var queries = require('../queries');
var app;

exports.init = function (myApp) {
  app = myApp;
};

var getRegisterNumber = function (reg) {
  return parseFloat(reg.label.split('_')[1]);
};

var constructResult = function (data, map) {
  var res = [];
  _.each(data, function (d) {
    res.push({
      label: d.label.value,
      count: d.count.value
    });
  });

  if (map) map(res);
  return res;
};

var sortByYear = function (data) {
  data.sort(function (a, b) {
    return a.label - b.label;
  });
};

var completeMissing = function (data) {
  var i = 1;
  var previousYear = data[0].label;

  while (i < data.length) {
    previousYear++;
    if (data[i].label !== previousYear) {
      data.splice(i, 0, {
        label: previousYear,
        count: 0
      });
      i++;
    }
    i++;
  }
};

exports.computeDashboard = function (socket) {
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
          var res = constructResult(data);
          fireResponse('ClassesOverview', res);
          return next();
        });
      },
      function (next) {
        endpoint.query(queries.PROPERTIES_OVERVIEW, function (err, result) {
          if (err) return next(err[2] || 'Virtuoso is not running');

          var data = result.results.bindings;
          // var vars = result.head.vars;

          var res= constructResult(data);
          fireResponse('PropertiesOverview', res);
          return next();
        });
      }
    ], function (err) {
      if (err) return socket.emit('res:err', err);
      return fireResponse('final');
    });
  };
};

exports.computeArchives = function (socket) {
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

    async.parallel([
      function (next) {
        endpoint.query(queries.CONTRACT_DISTRIBUTION_YEAR, function (err, result) {
          if (err) return next(err[2] || 'Virtuoso is not running');

          var data = result.results.bindings;
          var res = constructResult(data, function (contractYearHist) {
            sortByYear(contractYearHist);
            completeMissing(contractYearHist);
          });

          fireResponse('ContractsPerYear', res);
          return next();
        });
      }, function (next) {
        endpoint.query(queries.FOLIA_DISTRIBUTION_YEAR, function (err, result) {
          if (err) return next(err[2] || 'Virtuoso is not running');

          var data = result.results.bindings;
          var res = constructResult(data, function (foliaYearHist) {
            sortByYear(foliaYearHist);
            completeMissing(foliaYearHist);
          });

          fireResponse('FoliaPerYear', res);
          return next();
        });
      }, function (next) {
        endpoint.query(queries.CONTRACT_DISTRIBUTION_REGISTER, function (err, result) {
          if (err) return next(err[2] || 'Virtuoso is not running');

          var data = result.results.bindings;
          var res = constructResult(data, function (contractRegisterHist) {
            contractRegisterHist.sort(function (a, b) {
              var regA = getRegisterNumber(a);
              var regB = getRegisterNumber(b);

              return regA - regB;
            });
          });         

          fireResponse('ContractsPerRegister', res);
          return next();
        });
      }, function (next) {
        endpoint.query(queries.FOLIA_DISTRIBUTION_REGISTER, function (err, result) {
          if (err) return next(err[2] || 'Virtuoso is not running');

          var data = result.results.bindings;
          var res = constructResult(data, function (foliaRegisterHist) {
            foliaRegisterHist.sort(function (a, b) {
              var regA = getRegisterNumber(a);
              var regB = getRegisterNumber(b);

              return regA - regB;
            });
          });

          fireResponse('FoliaPerRegister', res);
          return next();
        });
      }
    ], function (err) {
      if (err) {
        console.log(err);
        return socket.emit('res:err', err);
      }
      return fireResponse('final');
    });
  };
};

// exports.computeOnQuery = function (socket) {
//   return function (message) {
//     var query = message.query;
//     var endpoint = new sparql.Client(message.sparql);
//     var graphName = message.graphName;

//     var describeQueries = [];
//     var stats;
//     var descriptions = [];

//     var done = function (data) {
//       return socket.emit('res:statistics', data);
//     };

//     var datasetSize = 0;

//     async.series([
//       function (next) {
//         endpoint.query(query, function (err, result) {
//           if (err) return socket.emit('res:err', err[2] || 'Virtuoso is not running');

//           var vars = result.head.vars;
//           var data = result.results.bindings;
//           datasetSize = data.length;

//           if (data.length === 0) return done({
//             length: 0
//           });

//           var queryCount = 0;
//           var numberPerQuery = 500;

//           for (var d = 0; d < data.length; d++) {
//             if (d % numberPerQuery === 0) {
//               queryCount++;
//               describeQueries[queryCount-1] = 'describe ';
//             }
//             for (var v = 0; v < vars.length; v++) {
//               var binding = data[d];
//               var variable = vars[v];

//               var resource = binding[variable];
//               if (!resource) continue;
//               if (resource.type !== 'uri') continue;

//               describeQueries[queryCount-1] += '<' + resource.value + '> ';
//             }
//           }

//           return next();
//         });
//       }, function (next) {
//         var parallelTasks = [];
//         _.each(describeQueries, function (describeQuery, queryIndex) {
//           if (describeQuery === 'describe ') return;

//           parallelTasks.push(function (_next) {
//             endpoint.query(describeQuery, function (err, result) {
//               if (err) {
//                 console.log(describeQuery);
//                 return _next(queryIndex + ': ' + (err[2] || 'Virtuoso is not running'));
//               }

//               if (!result) console.log('No result for query ' + queryIndex);
//               if (!result.head) console.log('No head for query ' + queryIndex);
//               if (!result.results) console.log('No result.results for query ' + queryIndex);

//               descriptions = descriptions.concat(result.results.bindings);

//               return _next();
//             });
//           });
//         });
      
//         async.parallel(parallelTasks, function (err) {
//           return next(err);
//         });
//       }, function (next) {
//         stats = {
//           types: {
//             chartType: 'PolarArea',
//             label: 'Entity types',
//             data: {}
//           },
//           predicates: {
//             chartType: 'BarPlot',
//             label: 'Relations histogram',
//             data: {}
//           },
//           overview: [{
//             label: 'Dataset size',
//             value: datasetSize
//           }]
//         };

//         for (var i = 0; i < descriptions.length; i++) {
//           var description = descriptions[i];

//           var subject = description.s;
//           var predicate = description.p;
//           var object = description.o;

//           var relation = transformLabel(predicate.value, '#');
//           if (!stats.predicates.data[relation]) stats.predicates.data[relation] = 0;
//           stats.predicates.data[relation]++;

//           if (predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
//             var type = object.value;

//             if (!stats.types.data[type]) stats.types.data[type] = 0;
//             stats.types.data[type]++;
//           }
//         }

//         return next();
//       }
//     ], function (err) {
//       if (err) return socket.emit('res:err', err);
//       return done(stats);
//     });
//   };
// };

// var transformLabel = function (l, s) {
//   var lsplit = l.split(s);
//   return lsplit[lsplit.length - 1];
// };