'use strict';

var ENV = process.env.NODE_ENV || 'development';
var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

var config = {
  development: {
    port: 7890,
    root: rootPath,
    serverUrl: 'http://localhost:7890/',
    name: 'Garzoni Data Explorer'
  },

  production: {
    port: 7890,
    root: rootPath,
    serverUrl: 'http://128.178.21.39:7890/',
    name: 'Garzoni Data Explorer'
  }
};

config = config[ENV];
config.ENV = ENV;
config.default_sparql_endpoint = (ENV === 'production') ? 'http://128.178.21.39:8890' : 'http://localhost:8890/sparql';
config.default_graph_name = (ENV === 'production') ? 'http://128.178.21.39:8080/garzoni-data' : 'http://localhost:8080/garzoni-data';

module.exports = config;
