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

var sortByLabel = function (data) {
  data.sort(function (a, b) {
    return parseInt(a.label) - parseInt(b.label);
  });
};

var completeMissing = function (data, min, max) {
  var i = 0;
  var previousValue = min;

  var newData = [];
  while (i < data.length && previousValue < max + 1) {
    if (previousValue < parseInt(data[i].label)) {
      newData.push({
        label: previousValue,
        count: 0
      });
    } else {
      newData.push(data[i]);
      i++;
    }
    previousValue++;
  }

  return newData;
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
        var res = constructResult(data, function (hist) {
          sortByLabel(hist);
        });

        var labels = res.map(function (el) {return parseInt(el.label);});
        var min = 1;
        var max = Math.max.apply(null, labels);
        res = completeMissing(res, min, max);

        var msg = {
          id: messageId,
          data: res,
          query: queries.generateContractsPerMonth(year)
        };

        socket.emit('res:' + msg.id, msg);
      });
    };
  },
  contractsForMonth: function (socket) {
    return function (message) {
      var messageId = message.id;
      var endpoint = new sparql.Client(message.sparql);
      var year = message.year;
      var month = message.month;

      endpoint.query(queries.generateContractsPerDay(year, month), function (err, result) {
        if (err) return socket.emit('res:err', err[2] || 'Virtuoso is not running');

        var data = result.results.bindings;
        var res = constructResult(data, function (hist) {
          sortByLabel(hist);
        });

        var labels = res.map(function (el) {return parseInt(el.label);});
        var min = 1;
        var max = Math.max.apply(null, labels);
        res = completeMissing(res, min, max);

        var msg = {
          id: messageId,
          data: res,
          query: queries.generateContractsPerDay(year, month)
        };

        socket.emit('res:' + msg.id, msg);
      });
    };
  },
  foliaForYear: function (socket) {
    return function (message) {
      var messageId = message.id;
      var endpoint = new sparql.Client(message.sparql);
      var year = message.year;

      endpoint.query(queries.generateFoliaPerMonth(year), function (err, result) {
        if (err) return socket.emit('res:err', err[2] || 'Virtuoso is not running');

        var data = result.results.bindings;
        var res = constructResult(data, function (hist) {
          sortByLabel(hist);
        });

        var labels = res.map(function (el) {return parseInt(el.label);});
        var min = 1;
        var max = Math.max.apply(null, labels);
        res = completeMissing(res, min, max);

        var msg = {
          id: messageId,
          data: res,
          query: queries.generateFoliaPerMonth(year)
        };

        socket.emit('res:' + msg.id, msg);
      });
    };
  },
  foliaForMonth: function (socket) {
    return function (message) {
      var messageId = message.id;
      var endpoint = new sparql.Client(message.sparql);
      var year = message.year;
      var month = message.month;

      endpoint.query(queries.generateFoliaPerDay(year, month), function (err, result) {
        if (err) return socket.emit('res:err', err[2] || 'Virtuoso is not running');

        var data = result.results.bindings;
        var res = constructResult(data, function (hist) {
          sortByLabel(hist);
        });

        var labels = res.map(function (el) {return parseInt(el.label);});
        var min = 1;
        var max = Math.max.apply(null, labels);
        res = completeMissing(res, min, max);

        var msg = {
          id: messageId,
          data: res,
          query: queries.generateFoliaPerDay(year, month)
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

    var fireResponse = function (status, data, query) {
      var msg = {
        id: messageId,
        status: status,
        data: data,
        query: query
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
          fireResponse('GraphOverview', graphOverview, queries.GRAPH_OVERVIEW);
          return next();
        });
      },
      function (next) {
        endpoint.query(queries.CLASSES_OVERVIEW, function (err, result) {
          if (err) return next(err[2] || 'Virtuoso is not running');

          var data = result.results.bindings;
          // var vars = result.head.vars;
          var res = constructResult(data);
          fireResponse('ClassesOverview', res, queries.CLASSES_OVERVIEW);
          return next();
        });
      },
      function (next) {
        endpoint.query(queries.PROPERTIES_OVERVIEW, function (err, result) {
          if (err) return next(err[2] || 'Virtuoso is not running');

          var data = result.results.bindings;
          // var vars = result.head.vars;

          var res= constructResult(data);
          fireResponse('PropertiesOverview', res, queries.PROPERTIES_OVERVIEW);
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

    var fireResponse = function (status, data, query) {
      var msg = {
        id: messageId,
        status: status,
        data: data,
        query: query
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
            sortByLabel(contractYearHist);
          });
          var labels = res.map(function (el) {return parseInt(el.label);});
          var min = Math.min.apply(null, labels);
          var max = Math.max.apply(null, labels);
          if (max > 1900 && min < 1570) {
            max = 1710;
            min = 1570;
          }
          res = completeMissing(res, min, max);

          fireResponse('ContractsPerYear', res, queries.CONTRACT_DISTRIBUTION_YEAR);
          return next();
        });
      }, function (next) {
        endpoint.query(queries.FOLIA_DISTRIBUTION_YEAR, function (err, result) {
          if (err) return next(err[2] || 'Virtuoso is not running');

          var data = result.results.bindings;
          var res = constructResult(data, function (foliaYearHist) {
            sortByLabel(foliaYearHist);
          });

          var labels = res.map(function (el) {return parseInt(el.label);});
          var min = Math.min.apply(null, labels);
          var max = Math.max.apply(null, labels);
          if (max > 1900 && min < 1570) {
            max = 1710;
            min = 1570;
          }
          res = completeMissing(res, min, max);

          fireResponse('FoliaPerYear', res, queries.FOLIA_DISTRIBUTION_YEAR);
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

          fireResponse('ContractsPerRegister', res, queries.CONTRACT_DISTRIBUTION_REGISTER);
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

          fireResponse('FoliaPerRegister', res, queries.FOLIA_DISTRIBUTION_REGISTER);
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

          fireResponse('RolesPerPersonMention', res, queries.PERSON_MENTION_DISTRIBUTION_ROLE);
          return next();
        });
      }, function (next) {
        endpoint.query(queries.PERSON_MENTION_DISTRIBUTION_ENTITY, function (err, result) {
          if (err) return next(err[2] || 'Virtuoso is not running');

          var data = result.results.bindings;
          var res = constructResult(data);

          fireResponse('PersonMentionPerEntity', res, queries.PERSON_MENTION_DISTRIBUTION_ENTITY);
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
