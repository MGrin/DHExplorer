/**
* DHExplorer server entry point
*
* Created by Nikita Grishin on 08.2015
*/
'use strict';
var express = require('express');
var async = require('async');
var fs = require('fs');
var sparql = require('jsparql');
var inflection = require('inflection');
var socket = require('socket.io');

var app = express();

app.config = require('./config/config.server');
app.sparql = new sparql(app.config.default_sparql_endpoint, app.config.default_graph_name);

require('./config/logger.server')(app);
exports = module.exports = app;

async.series([
  // Configuring Express.js, controllers, routes, socket.io and starting the server
  function (next) {
    require('./config/express')(app);

    app.controllers = {};
    var controllersPath = __dirname + '/app/controllers';
    fs.readdirSync(controllersPath).forEach(function (file) {
      var controller = require(controllersPath + '/' + file);
      controller.init(app);

      var fileName = file.replace(/.server.controller.js$/, '');
      var controllerName = inflection.camelize(fileName);
      app.controllers[controllerName] = controller;
    });

    require('./app/routes.server.js')(app);
    var server = require('http').createServer(app);

    app.io = socket(server);
    require('./app/socket.server.js')(app);

    server.listen(app.config.port);
    app.logger.info('Express app started on port ' + app.config.port);

    return next();
  }
], function (err) {
  if (err) {
    app.err(err);
    app.err('Could not start the server. See problems above.');

    process.exit();
  }

  app.logger.info('Server is running');
});
