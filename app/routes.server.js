'use strict';

module.exports = function (app) {
  var index = app.controllers.Index;
  var search = app.controllers.Search;

  app.route('/')
    .get(index.dashboard);

  app.route('/search/:entity')
    .get(search.query);

  app.param('entity', function (req, res, next, e) {
    req.entity = e;
    return next();
  });
};
