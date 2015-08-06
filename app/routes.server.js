'use strict';

module.exports = function (app) {
  var index = app.controllers.Index;
  app.route('/')
    .get(index.dashboard);
};