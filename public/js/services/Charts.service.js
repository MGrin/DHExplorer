'use strict';

(function (app) {
  var Charts = app.Charts = {};

  var sorters = {
    'label.number': function (a, b) {
      return parseInt(a.label) - parseInt(b.label);
    },
    'label.register': function (a, b) {
      var regA = parseFloat(a.label.split('_')[1]);
      var regB = parseFloat(b.label.split('_')[1]);

      return regA - regB;
    },
    'value.number': function (a, b) {
      return parseInt(a.count) - parseInt(b.count);
    },
    'value.number.inverse': function (a, b) {
      return parseInt(b.count) - parseInt(a.count);
    }
  };
  var filters = {

  };

  var transformations = {
    label: {
      'label.register': function () {
        return app.React.helpers.transformRegisterLabel;
      },
      'label.RDF' : function (sep) {
        return app.React.helpers.transformRDFLabel(sep);
      },
      'label.month' : function () {
        return app.React.helpers.monthNumberToString;
      }
    },
    value: {
      top: function (threshold) {
        return app.React.helpers.computeTop(threshold);
      }
    }
  };

  var listeners = {
    showAsTable: function (title) {
      return app.React.helpers.showAsTableCb(title);
    },
    saveAsImage: function () {
      return app.React.helpers.saveAsImage;
    },
    'show.subplot': function (subplotName) {
      var that = this;
      var subplots = this.description.subplots;

      var err = new Error('No subplot called "' + subplotName + '" in the description of the plot "' + this.description.name + '". Check your charts.json for the subplot field!');
      if (!subplots || subplots.length === 0) throw err;

      var subplotDescription;

      for (var i = 0; i < subplots.length; i++) {
        if (subplots[i].name === subplotName) {
          subplotDescription = subplots[i];
          break;
        }
      }

      if (!subplotDescription) throw err;

      var subchart = constructChart(subplotDescription);

      return function (label, reactComponent) {
        subchart.compileVariables(label.value || label, that.chart.variables);
        reactComponent.setChart(subchart);
        reactComponent.state.chart.executeQuery(function () {
          reactComponent.setState({iteration: reactComponent.state.iteration + 1});
        });
      };
    },
    'show.entity' : function () {
      var chart = this.chart;
      return function (label) {
        var entityLabel = label.value || label;

        var entityMetadata;
        for (var i = 0; i < chart.metadata.length; i++) {
          if (chart.metadata[i].label.value === entityLabel) {
            entityMetadata = chart.metadata[i];
            break;
          }
        }

        if (!entityMetadata) return console.log('Person not found');
        app.StatisticsController.showEntity(entityMetadata.person);
      };
    }
  };

  var constructChart = function (chartDesc) {
    var chart = new app.models.Chart(chartDesc.name, chartDesc.query, chartDesc.type.toLowerCase(), chartDesc.options);

    chart.setVariables(chartDesc.variable);

    if (chartDesc.sort) {
      if (chartDesc.sort.type === 'standart') chart.sort(sorters[chartDesc.sort.value]);
    }

    if (chartDesc.filter) {
      if (chartDesc.filter.type === 'standart') chart.filter(filters[chartDesc.filter.value]);
    }

    if (chartDesc.transformations) {
      var args;
      if (chartDesc.transformations.label) {
        args = chartDesc.transformations.label.arguments || [];
        if (chartDesc.transformations.label.type === 'standart') chart.transformLabel(transformations.label[chartDesc.transformations.label.value].apply({}, args));
      }
      if (chartDesc.transformations.value) {
        args = chartDesc.transformations.value.arguments || [];
        if (chartDesc.transformations.value.type === 'standart') chart.transformValue(transformations.value[chartDesc.transformations.value.value].apply({}, args));
      }
    }

    if (chartDesc.listeners) {
      Object.keys(chartDesc.listeners).map(function (l) {
        if (chartDesc.listeners[l].type === 'standart') {
          var args = chartDesc.listeners[l].arguments || [];
          chart.addListener(l, listeners[chartDesc.listeners[l].value].apply({description: chartDesc, chart: chart}, args));
        }
      });
    }
    chart.addListener('onShowAsTableClick', listeners.showAsTable(chart.title));
    chart.addListener('onSaveAsImageClick', listeners.saveAsImage());

    return chart;
  };

  $.getJSON('/res/charts.json', function (chartsJSON) {
    Object.keys(chartsJSON).map(function (view) {
      if (!Charts[view]) Charts[view] = [];
      chartsJSON[view].map(function (chartDesc) {
        var chart = constructChart(chartDesc);
        Charts[view].push(chart);
      });
    });
  });
})(window.app);
