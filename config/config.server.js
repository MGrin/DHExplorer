'use strict';

var ENV = process.env.NODE_ENV || 'development';
var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

var config = {
  development: {
    sparql: 'http://128.178.21.39:8890/',
    port: 7890,
    root: rootPath,
    serverUrl: 'http://localhost:7890/',
    name: 'Garzoni Data Explorer'
  },

  production: {
    sparql: 'http://128.178.21.39:8890/',
    port: 7890,
    root: rootPath,
    serverUrl: 'http://localhost:7890/',
    name: 'Garzoni Data Explorer'
  }
};

config = config[ENV];
config.ENV = ENV;

module.exports = config;