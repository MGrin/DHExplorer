'use strict';
var sparql = require('sparql');
var queries = require('../queries');
var hash = require('object-hash');

var app;

exports.init = function (myApp) {
  app = myApp;
};

exports.query = function (req, res) {
  // var entity = req.entity;
  var sparqlEndpoint = req.query.endpoint;
  var q = req.query.q;

  var endpoint = new sparql.Client(sparqlEndpoint);
  endpoint.query(queries.generateSearchPersonQuery(q), function (err, result) {
    if (err) return app.err(err, res);

    var data = result.results.bindings;

    var countLimit = (data.length < 10) ? data.length : 10;

    var answer = {
      results: []
    };

    for (var i = 0; i < countLimit; i++) {
      answer.results.push({
        title: data[i].name.value,
        description: data[i].person.value,
        tuple: data[i].person
      });
    }

    return res.send(answer);
  });
};