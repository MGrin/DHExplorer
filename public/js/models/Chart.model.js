/**
* A Chart model.
* Used to transform JSON desription of the statistical chart to the object
* that then will be used to plot the chart itself
*
* Created by Nikita Grishin on 10.2015
*/
'use strict';

(function (app) {
  /**
   * @param {string} title - the title of the Chart. Can contain parameters written as {{parameterName}}
   * @param {string} query - the query of the Chart. Should output a table with only 2 columns, "label" and "count". Can contain parameters written as {{parameterName}}
   * @param {string} type  - the type of Chart: "bar" or "plot"
   * @param {object} opts  - chart options such as colors, x-scale factor, etc...
   */
  var Chart = function (title, query, type, opts) {
    // saving original title and query with parameters
    this._title = title;
    this._query = query;

    this.title = title;
    this.query = query;

    this.type = type;
    this.options = opts || {};

    // an object holding transformations that will be applied to labels of counts
    this.transforms = {};
    // an object holding listeners of this Chart (such as onBarClick, onSaveImageClick, etc...)
    this.listeners = {};
    // an object holding query configurations: actions that should be applied to the query result on the backend
    this.queryConfig = {};

    // a "sort" option will sort the data
    if (this.options.sort) {
      this.queryConfig.sort = this.options.sort;
      delete this.options.sort;
    }

    // a "complete"option will ask a server to complete missing labels.
    // For example, for years, if there is no data for years between 1560 and 1570, this option will ask server to fill these years with 0
    if (this.options.complete) {
      this.queryConfig.complete = this.options.complete;
      delete this.options.complete;
    }
  };

  /**
   * @param {string} variable - a name of a new variable that is added to the query (and title)
   */
  Chart.prototype.setVariables = function (variable) {
    var that = this;
    that.variables = {};

    if (variable) {
      this.variables[variable] = null;
      this.newVariable = variable;
    }
    return this;
  };

  /**
   * @param  {Function} fn - a sorting function that will be applied to data
   * fn should take 2 elements a and b and return an integer about the order of these elements
   */
  Chart.prototype.sort = function (fn) {
    this.sortFn = fn;
    return this;
  };

  /**
   * @param  {Function} fn - a filtering function that will be applied to data
   */
  Chart.prototype.filter = function (fn) {
    this.filterFn = fn;
    return this;
  };

  /**
   * @param  {Function} fn - a transformation function that will be applied to all labels
   * fn should take a label and return a transformed label
   */
  Chart.prototype.transformLabel = function (fn) {
    this.transforms.label = fn;
    return this;
  };

  /**
   * @param  {Function} fn - a transformation function that will be applied to all values
   * fn should take a whole dataset and return a function fn2 (this step is used for the aggregation of data)
   * fn2 should take an element and return true if this element should be plotet or not
   */
  Chart.prototype.transformValue = function (fn) {
    this.transforms.value = fn;
    return this;
  };

  /**
   * @param {string}  name - an event name
   * @param {Function} fn - a function will be called on some event
   */
  Chart.prototype.addListener = function (name, fn) {
    this.listeners[name] = fn;
    return this;
  };

  /**
   * @param {object}  a configuration that will extend the existing query configuration
   */
  Chart.prototype.addQueryConfig = function (cfg) {
    var that = this;
    Object.keys(cfg).map(function (k) {
      that.queryConfig[k] = cfg[k];
    });
  };

  /**
   * Compiling query and title by replacing variables with given values
   *
   * @param  {string} a value of the current chart proper variable
   * @param  {object} a parent's chart variables list
   */
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

  /**
   * Executes query, apply all necessary functions as sort, filter, transformations, etc and calls the callback with result
   * @param  {Function} a callback function
   */
  Chart.prototype.executeQuery = function (cb) {
    if (this.isLoaded()) return cb();

    var that = this;

    // Sending the chart query to server
    app.Socket.statisticsQuery(this.query, function (data) {
      // Sorting data
      if (that.sortFn) data.sort(that.sortFn);
      // Filtering data
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

      // Completing data
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

      // running the aggregation function of values transformation
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
