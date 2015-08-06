/**
 * Module dependencies.
 */

'use strict';

var express = require('express');
var compress = require('compression');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var _ = require('underscore');

module.exports = function (app) {
  var config = app.config;

  app.set('showStackError', true);
  // app.use(favicon(app.config.root + '/public/img/favicon.ico'));

  // should be placed before express.static
  app.use(compress({
    filter: function (req, res) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
    },
    level: 9
  }));
  app.use(express.static(config.root + '/public'));

  app.use(logger('dev', {stream: app.expressLogStream}));

  // set views path, template engine and default layout
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'jade');


  // enable jsonp
  app.enable('jsonp callback');

  // pass req object to jade views through locals object
  app.use(function (req, res, next) {
    res.locals.req = req;
    next();
  });

  app.use(bodyParser.json({limit: '1024mb'}));
  app.use(bodyParser.urlencoded({limit: '1024mb', extended: true}));
  app.use(methodOverride());

  // remove */* from accept headers to solve problem with express 4 req.format function
  // if */* is specified, it does not separate
  // between html and json
  app.use(function (req, res, next) {
    if (!req.headers.accept) return next();

    req.headers.accept = req.headers.accept.replace(', */*', '').replace('*/*', '');
    next();
  });

  // parse 'false' and 'true' from req.query into Boolean false and true
  app.use(function (req, res, next) {
    var query = req.query;

    _.each(query, function (value, key) {
      if (value === 'false') {
        query[key] = false;
      }
      if (value === 'true') {
        query[key] = true;
      }
    });

    next();
  });
};
