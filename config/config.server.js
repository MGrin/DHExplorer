'use strict';

var ENV = process.env.NODE_ENV || 'development';
var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

var config = {
  development: {
    port: 7890,
    root: rootPath,
    serverUrl: 'http://localhost:7890/',
    name: 'Garzoni Data Explorer',
    garzoniGraphName: 'http://128.178.21.39:8080/garzoni-data/'
  },

  production: {
    port: 7890,
    root: rootPath,
    serverUrl: 'http://128.178.21.39:7890/',
    name: 'Garzoni Data Explorer',
    garzoniGraphName: 'http://128.178.21.39:8080/garzoni-data/'
  }
};

config = config[ENV];
config.ENV = ENV;

module.exports = config;