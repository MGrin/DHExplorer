/**
 * React Component Helper - some useful functions used everywhere in react componenets
 *
 * Created by Nikita Grishin on 08.2015
 */

'use strict';

(function (app) {
  app.React.helpers = {};
  // Saving the chart as an image
  app.React.helpers.saveAsImage = function (node) {
    return function () {
      var n = $(ReactDOM.findDOMNode(node));
      var dataUrl;
      n.find('canvas').each(function () {
        dataUrl = $(this).get(0).toDataURL('image/png');
      });
      window.open(dataUrl);
    };
  };

  // Showing chart data as table
  app.React.helpers.showAsTableCb = function (title) {
    return function (data) {
      return function () {
        $('#statistics-modal .header').text(title);
        ReactDOM.render(
          <app.React.ChartTable data={data} />,
          $('#statistics-modal .content').get(0)
        );
        $('#statistics-modal').modal('show');
      };
    };
  };

  // Creates a hidden label for charts
  app.React.helpers.HiddenLabel = function (label) {
    this.value = label;
  };

  app.React.helpers.HiddenLabel.prototype.toString = function () {
    return '';
  };

  // Helper function that transforms RDF lable to more user-friendly
  app.React.helpers.transformRDFLabel = function (sym) {
    return function (value) {
      var spl = value.split(sym);
      return spl[spl.length - 1];
    };
  };

  // Helper function that transforms register name to more user-friendly
  app.React.helpers.transformRegisterLabel = function (value) {
    var index = value.indexOf(app.config.default_graph_name);
    if (index === -1) return value;
    return value.substring(index + app.config.default_graph_name.length);
  };

  app.React.helpers.computeMean = function (data) {
    var sum = 0;
    for (var i = 0; i < data.length; i++) {
      sum += parseInt(data[i].value || data[i].count);
    }

    return sum / data.length;
  };

  app.React.helpers.computeTop = function (threshold) {
    return function (data) {
      var max = Math.max.apply(null, data.map(function (el) {
        return parseInt(el.count);
      }));

      return function (el) {
        return parseInt(el) > threshold * max;
      };
    };
  };

  var monthes = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Juin', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  app.React.helpers.MonthLabel = function (number) {
    this.value = parseInt(number);
    this.str = monthes[this.value - 1];
  };

  app.React.helpers.MonthLabel.prototype.toString = function () {
    return this.str;
  };

  app.React.helpers.monthNumberToString = function (number) {
    return new app.React.helpers.MonthLabel(number);
  };

  app.React.helpers.noop = function () {};
})(window.app);
