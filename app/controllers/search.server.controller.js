'use strict';
/**
 * Search controller
 *
 * Created by Nikita Grishin on 08.2015
 */
var queries = require('../queries');

var app;

exports.init = function (myApp) {
  app = myApp;
};

/**
 * Handles the search request
 * @param  {Object} request object
 * @param  {Object} response object
 * @return {null}
 */
exports.query = function (req, res) {
  var q = req.query.q; // the search query is passed in request parameters

  app.sparql.query(queries.generateSearchPersonQuery(q), function (err, result) {
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
