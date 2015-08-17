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
      count: d.count.value,
      metadata: d
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

exports.histogram = {
  contractsForYear: function (socket) {
    return function (message) {
      var messageId = message.id;
      var endpoint = new sparql.Client(message.sparql);
      var year = message.year;

      endpoint.query(queries.generateContractsPerMonth(year), function (err, result) {
        if (err) return socket.emit('res:err', err[2] || 'Virtuoso is not running');

        var data = result.results.bindings;
        var res = constructResult(data, function () {
          // sortByYear(contractYearHist);
          // completeMissing(contractYearHist);
        });

        var msg = {
          id: messageId,
          data: res
        };

        socket.emit('res:' + msg.id, msg);
      });
    };
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
        var overview = [];

        async.series([
          function (_next) {
            endpoint.query(queries.AVERAGE_CONTRACTS_NUMBER, function (err, result) {
              if (err) return _next(err[2] || 'Virtuoso is not running');

              var data = result.results.bindings[0];
              overview.push({
                label: 'Average number of contracts per year',
                value: data.count.value
              });
              return _next();
            });
          },
          function (_next) {
            endpoint.query(queries.TOTAL_CONTRACTS_COUNT, function (err, result) {
              if (err) return _next(err[2] || 'Virtuoso is not running');

              var data = result.results.bindings[0];
              overview.push({
                label: 'Number of contracts',
                value: data.count.value
              });
              return _next();
            });
          }, function (_next) {
            endpoint.query(queries.TOTAL_FOLIA_COUNT, function (err, result) {
              if (err) return _next(err[2] || 'Virtuoso is not running');

              var data = result.results.bindings[0];
              overview.push({
                label: 'Number of folias',
                value: data.count.value
              });
              return _next();
            });
          }
        ], function (err) {
          if (err) return next(err);
          fireResponse('ArchivesOverview', overview);
          return next();
        });
      }, function (next) {
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

exports.computePeople = function (socket) {
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
        var overview = [];

        async.series([
          function (_next) {
            endpoint.query(queries.AVERAGE_PERSON_MENTION_PER_ENTITY, function (err, result) {
              if (err) return _next(err[2] || 'Virtuoso is not running');

              var data = result.results.bindings[0];
              overview.push({
                label: 'Average number of person mentions per person entity',
                value: data.count.value
              });

              return _next();
            });
          }, function (_next) {
            endpoint.query(queries.TOTAL_PERSONS_MENTION_COUNT, function (err, result) {
              if (err) return _next(err[2] || 'Virtuoso is not running');

              var data = result.results.bindings[0];
              overview.push({
                label: 'Total number of person mentions',
                value: data.count.value
              });

              return _next();
            });
          }, function (_next) {
            endpoint.query(queries.TOTAL_PERSONS_ENTITIES_COUNT, function (err, result) {
              if (err) return _next(err[2] || 'Virtuoso is not running');

              var data = result.results.bindings[0];
              overview.push({
                label: 'Total number of person entities',
                value: data.count.value
              });

              return _next();
            });
          }
        ], function (err) {
          if (err) return next(err);
          fireResponse('PeopleOverview', overview);
          return next();
        });
      }, function (next) {
        endpoint.query(queries.PERSON_MENTION_DISTRIBUTION_ROLE, function (err, result) {
          if (err) return next(err[2] || 'Virtuoso is not running');

          var data = result.results.bindings;
          var res = constructResult(data);

          fireResponse('RolesPerPersonMention', res);
          return next();
        });
      }, function (next) {
        endpoint.query(queries.PERSON_MENTION_DISTRIBUTION_ENTITY, function (err, result) {
          if (err) return next(err[2] || 'Virtuoso is not running');

          var data = result.results.bindings;
          var res = constructResult(data);

          fireResponse('PersonMentionPerEntity', res);
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
