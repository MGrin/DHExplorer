'use strict';

(function (app) {
  var Chart = function (title, query, type, opts) {
    this._title = title;
    this._query = query;

    this.title = title;
    this.query = query;

    this.type = type;
    this.options = opts || {};

    this.transforms = {};
    this.listeners = {};

    this.queryConfig = {};
    if (this.options.sort) {
      this.queryConfig.sort = this.options.sort;
      delete this.options.sort;
    }
    if (this.options.complete) {
      this.queryConfig.complete = this.options.complete;
      delete this.options.complete;
    }
  };

  Chart.prototype.setVariables = function (variable) {
    var that = this;
    that.variables = {};

    if (variable) {
      this.variables[variable] = null;
      this.newVariable = variable;
    }
    return this;
  };

  Chart.prototype.sort = function (fn) {
    this.sortFn = fn;
    return this;
  };

  Chart.prototype.filter = function (fn) {
    this.filterFn = fn;
    return this;
  };

  Chart.prototype.transformLabel = function (fn) {
    this.transforms.label = fn;
    return this;
  };

  Chart.prototype.transformValue = function (fn) {
    this.transforms.value = fn;
    return this;
  };

  Chart.prototype.addListener = function (name, fn) {
    this.listeners[name] = fn;
    return this;
  };

  Chart.prototype.addQueryConfig = function (cfg) {
    var that = this;
    Object.keys(cfg).map(function (k) {
      that.queryConfig[k] = cfg[k];
    });
  };

  Chart.prototype.compileVariables = function (variableValue, parentVariables) {
    var that = this;
    $.extend(that.variables, parentVariables);
    that.variables[that.newVariable] = variableValue;

    that.query = that._query;
    that.title = that._title;

    Object.keys(that.variables).map(function (v) {
      that.query = that.query.replace(new RegExp('\{\{' + v + '\}\}', 'g'), that.variables[v]);
      that.title = that.title.replace(new RegExp('\{\{' + v + '\}\}', 'g'), that.variables[v]);
    });

    delete this.data;
    delete this.labels;
    delete this.values;
    delete this.metadata;
  };

  Chart.prototype.executeQuery = function (cb) {
    if (this.isLoaded()) return cb();

    var that = this;

    app.Socket.statisticsQuery(this.query, function (data) {
      data = data.map(function (d) {
        return {count: d.count.value, label: d.label.value, metadata: d};
      });

      if (that.sortFn) data.sort(that.sortFn);
      if (that.filterFn) {
        if (typeof(that.filterFn) === 'function') {
          data = data.filter(that.filterFn);
        } else {
          data = data.filter(function (el) {
            return el.value > that.filterFn;
          });
        }
      }

      that.data = data;

      if (that.queryConfig.complete) {
        var isNumber = true;
        var labels = that.data.map(function (el) {
          var res;
          try {
            res = parseInt(el.label);
          } catch (e) {
            isNumber = false;
            res = el.label;
          }
          return res;
        });
        if (isNumber) {
          var min = Math.min.apply({}, labels);
          var max = Math.max.apply({}, labels);
          if (max > 1900 && min < 1570) {
            max = 1710;
            min = 1570;
          }
          that.data = completeMissing(that.data, min, max);
        }
      }

      if (that.transforms.value) that.transforms.value = that.transforms.value(that.data);

      that.labels = [];
      that.values = [];
      that.metadata = [];

      that.data.map(function (el) {
        if (!that.transforms.value) {
          if (that.transforms.label) that.labels.push(that.transforms.label(el.label));
          else that.labels.push(el.label);
          that.values.push(parseInt(el.count));
          that.metadata.push(el.metadata);
        } else if (that.transforms.value(el.count)) {
          if (that.transforms.label) that.labels.push(that.transforms.label(el.label));
          else that.labels.push(el.label);
          that.values.push(parseInt(el.count));
          that.metadata.push(el.metadata);
        }
      });

      cb();
    });
  };

  Chart.prototype.isLoaded = function () {
    return this.data ? true : false;
  };

  Chart.prototype.hasPlot = function () {
    return this.plot ? true : false;
  };

  Chart.prototype.setPlot = function (plot) {
    this.plot = plot;
    return this;
  };

  Chart.prototype.getPlot = function () {
    return this.plot;
  };

  Chart.prototype.destroyPlot = function () {
    this.plot.destroy();
    return this;
  };

  app.models.Chart = Chart;

  var completeMissing = function (data, min, max) {
    var i = 0;
    var previousValue = min;

    var newData = [];
    while (i < data.length && previousValue < max + 1) {
      if (previousValue < parseInt(data[i].label)) {
        newData.push({
          label: previousValue,
          count: 0
        });
      } else {
        newData.push(data[i]);
        i++;
      }
      previousValue++;
    }

    return newData;
  };
}(window.app));
