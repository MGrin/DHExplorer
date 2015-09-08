'use strict';
var http = require('http');
var querystring = require('querystring');

var sparql = function (endpoint, graph) {
  this.endpoint = endpoint;
  this.graph = graph;
};

sparql.prototype.query = function (options, cb) {
  if (typeof(options) === 'string') {
    options = {
      graph: null,
      query: options
    };
  }

  var graph = options.graph || this.graph;
  var query = options.query;

  if (!query) return cb(new Error('No query provided!'));
  if (!graph) return cb(new Error('No graph provided!'));

  var httpParams = querystring.stringify({
    'default-graph-uri': graph,
    query: query,
    'should-sponge': 'grab-everything',
    format: 'application/sparql-results+json',
    timeout: 0
  });
  var uri = this.endpoint + '?' + httpParams;

  http.get(uri, function (res) {
    var statusCode = res.statusCode;
    if (statusCode !== 200) return cb(new Error('Error code: ' + statusCode));
    var str = '';

    res.on('data', function (data) {
      str += data;
    });

    res.on('end', function () {
      try {
        return cb(null, JSON.parse(str));
      } catch (e) {
        return cb(e);
      }
    });
  }).on('error', cb);
};

module.exports = sparql;
