'use strict';

(function (app, Dom) {
  var status = app.StatusController = {};

  status.runningTasks = [];

  app.Socket.registerGlobalListener('res:err', function (err) {
    console.log(err);
    status.showError(err);
  });

  status.showError = function (err) {
    status.runningTasks.map(function (t) {
      status.completeTask(t);
    });
    Dom.showError(err);
  };

  status.createTask = function (source, text, dimmer) {
    return  {
      id: objectHash(source + '|' + text),
      source: source,
      text: text,
      dimmer: dimmer
    };
  };

  status.addTask = function (task) {
    status.runningTasks.push(task);
    if (!task.dimmer) {
      Dom.startStatusLoader();
      Dom.setStatusText(task.text);
    } else {
      Dom.showDimmer(task.text);
    }
  };

  status.completeTask = function (task) {
    var index = -1;
    for (var i = 0; i < status.runningTasks.length; i++) {
      if (status.runningTasks[i].id === task.id) {
        index = i;
        break;
      }
    }

    if (index === -1) return;

    status.runningTasks.splice(index, 1);
    if (task.dimmer) {
      Dom.hideDimmer();
    }
    if (status.runningTasks.length === 0) {
      Dom.setStatusText('');
      Dom.stopStatusLoader();
      return;
    }

    Dom.startStatusLoader();
    Dom.setStatusText(status.runningTasks[0].text);
  };

  status.getRunningTask = function () {
    if (status.runningTasks.length === 0) return;

    return status.runningTasks[status.runningTasks.length - 1];
  };
})(window.app, window.app.dom);
