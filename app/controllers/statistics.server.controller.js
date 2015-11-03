'use strict';
/**
 * Statistics controller
 *
 * Created by Nikita Grishin on 08.2015
 */
var _ = require('underscore');
var app;

exports.init = function (myApp) {
  app = myApp;
};

/**
 * @param  {Array} data retrieved from database
 * @return {Array} an array with transformed structure for easy use on the frontend
 */
var constructResult = function (data) {
  var res = [];
  _.each(data, function (d) {
    res.push({
      label: d.label.value,
      count: d.count.value,
      metadata: d
    });
  });

  return res;
};

/**
 * Handles the statistics query.
 * Query should contain 2 (and only 2!) variables, callend `label` for the items query is making statistics on, and `count` for the count of each label
 *
 * @param  {socket} a socket object to send the response
 * @return {Function} a handler function
 */
exports.query = function (socket) {
  /**
   * @param  {Object} a request message. Should contain:
   *                                       * a message @id will be used to send the response
   *                                       * a @query to execute to get the statistics data
   * @return {[type]}
   */
  return function (message) {
    app.logger.info('req:statistics:query');
    app.sparql.query(message.query, function (err, result) {
      if (err) return app.err(err, socket);

      var data = result.results.bindings;

      var res = constructResult(data);

      var msg = {
        id: message.id,
        data: res
      };

      socket.emit('res:' + msg.id, msg);
    });
  };
};
