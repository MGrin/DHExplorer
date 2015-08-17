'use strict';

(function (window) {
  var app = window.app = {};
  if (window.location.href.indexOf('localhost') === -1 && window.location.href.indexOf('127.0.0.1') === -1) {
    app.env = 'production';
  } else {
    app.env = 'development';
  }

  app.models = {};
  app.views = {};

  app.require = {
    domLoadedCallbacks: {},
    domLoadedCallbacksDone: {},
    count: 0,
    order: 1
  };

  app.addOnDocumentReady = function (name, cb, deps) {
    if (!cb) console.log(name);
    if (app.require.domLoadedCallbacks[name]) return;

    if (!deps) deps = [];
    app.require.count++;

    app.require.domLoadedCallbacks[name] = {};
    app.require.domLoadedCallbacks[name].deps = deps;
    app.require.domLoadedCallbacks[name].exec = function () {
      for (var i = 0; i < deps.length; i++) {
        if (!app.require.domLoadedCallbacksDone[deps[i]]) throw new Error(deps[i] + ' was not initialized yet!');
      }
      cb();
      app.require.domLoadedCallbacksDone[name] = app.require.order;
      app.require.order++;
    };
  };

  var canBeRun = function (name) {
    for (var i = 0; i < app.require.domLoadedCallbacks[name].deps.length; i++) {
      if (!app.require.domLoadedCallbacksDone[app.require.domLoadedCallbacks[name].deps[i]]) return false;
    }

    return true;
  };

  $(document).ready(function () {
    for (var i = 0; i < app.require.count; i++) {
      for (var task in app.require.domLoadedCallbacks) {
        if (app.require.domLoadedCallbacks[task]) {
          if (canBeRun(task)) {
            app.require.domLoadedCallbacks[task].exec();
            delete app.require.domLoadedCallbacks[task];
          }
        }
      }
    }

    if (app.require.count < app.require.order) return;

    var errStr = 'Failed dependencies: ';
    for (var task in app.require.domLoadedCallbacks) {
      if (app.require.domLoadedCallbacks[task]) {
        errStr += task + ': [';
        for (var i = 0; i < app.require.domLoadedCallbacks.deps; i++) {
          errStr += app.require.domLoadedCallbacks.deps[i] + ', ';
        }
        errStr += ']\n';
      }
    }
    throw new Error(errStr);
  });
})(window);
