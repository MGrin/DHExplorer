'use strict';

var app;

exports.init = function (myApp) {
  app = myApp;
};

exports.dashboard = function (req, res) {
  res.render('dashboard.jade');
};
