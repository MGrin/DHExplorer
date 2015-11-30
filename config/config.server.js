'use strict';

var ENV = process.env.NODE_ENV || 'development';
var PORT = process.env.PORT || 7890;
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
    port: PORT,
    root: rootPath,
    serverUrl: 'http://dhexplorer.org/',
    name: 'Garzoni Data Explorer'
  }
};

config = config[ENV];
config.ENV = ENV;
config.default_sparql_endpoint = (ENV !== 'development') ? 'http://128.178.21.22:8890/sparql' : 'http://192.168.99.100:8890/sparql';
config.default_graph_name = (ENV !== 'development') ? 'http://128.178.21.22:8080/garzoni-data' : 'http://localhost:8080/garzoni-data';

module.exports = config;
