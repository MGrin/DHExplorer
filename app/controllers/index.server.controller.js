'use strict';

var app;

exports.init = function (myApp) {
  app = myApp;
};

exports.home = function (req, res) {
  res.render('index.jade');
};

exports.dashboard = function (req, res) {
  res.render('dashboard.jade');
};
