(function (app) {
  app.React = {};

  app.React.helpers = {};
  app.React.helpers.saveAsImage = function (node) {
    return function () {
      var n = $(React.findDOMNode(node));
      var dataUrl;
      n.find('canvas').each(function () {
        dataUrl = $(this).get(0).toDataURL('image/png');
      });
      window.open(dataUrl);
    };
  };

  app.React.helpers.showAsTableCb = function (title) {
    return function (data) {
      return function () {
        $('#statistics-modal .header').text(title);
        React.render(
          <app.React.HistogramTable data={data} />,
          $('#statistics-modal .content').get(0)
        );
        $('#statistics-modal').modal('show');
      };
    };
  };

  app.React.helpers.HiddenLabel = function (label) {
    this.value = label;
  };

  app.React.helpers.HiddenLabel.prototype.toString = function () {
    return '';
  };

  app.React.helpers.transformRDFLabel = function (sym) {
    return function (value) {
      var spl = value.split(sym);
      return spl[spl.length - 1];
    };
  };

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
        return parseInt(el.value || el.count);
      }));

      return function (el) {
        return parseInt(el.value || el.count) > threshold * max;
      };
    };
  };
})(window.app);
