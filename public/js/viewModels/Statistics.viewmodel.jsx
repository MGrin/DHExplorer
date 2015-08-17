'use strict';

(function (app) {
  var statistics = app.views.Statistics = {};

  var showAsTableCb = function (title) {
    return function (data) {
      return function () {
        $('#statistics-modal .header').text(title);
        React.render(
          <StatsTable data={data} />,
          $('#statistics-modal .content').get(0)
        );
        $('#statistics-modal').modal('show');
      };
    };
  };

  var transformRDFLabel = function (sym) {
    return function (value) {
      var spl = value.split(sym);
      return spl[spl.length - 1];
    };
  };
  var transformRegisterLabel = function (value) {
    var index = value.indexOf(app.config.default_graph_name);
    if (index === -1) return value;
    return value.substring(index + app.config.default_graph_name.length);
  };
  var computeMean = function (data) {
    var sum = 0;
    for (var i = 0; i < data.length; i++) {
      sum += parseInt(data[i].value || data[i].count);
    }

    return sum / data.length;
  };

  var computeTop = function (threshold) {
    return function (data) {
      var max = Math.max.apply(null, data.map(function (el) {
        return parseInt(el.value || el.count);
      }));

      return function (el) {
        return parseInt(el.value || el.count) > threshold * max;
      };
    };
  };

  statistics.listeners = {};
  statistics.registerListener = function (name, fn) {
    if (!statistics.listeners[name]) statistics.listeners[name] = [];
    statistics.listeners[name].push(fn);
  };
  statistics.emit = function (name, data) {
    for (var i = 0; i < statistics.listeners[name].length; i++) {
      statistics.listeners[name][i](data);
    }
  };

  statistics.init = function (view) {
    switch (view) {
      case 'dashboard' : {
        statistics.initDashboard();
        break;
      }
      case 'archives' : {
        statistics.initArchives();
        break;
      }
      case 'people' : {
        statistics.initPeople();
        break;
      }
    }
  };

  statistics.initDashboard = function () {
    statistics.Dashboard = {
      Overview: React.render(
        <GraphOverviewSegment />,
        $('#graph-overview').get(0)
      ),
      Classes: React.render(
        <PieSegment />,
        $('#classes-overview').get(0)
      ),
      Properties: React.render(
        <PieSegment />,
        $('#properties-overview').get(0)
      )
    };

    statistics.Dashboard.Classes.setState({
      title: 'Classes overview',
      listeners: {
        onShowAsTableClick: showAsTableCb('Classes overview')
      },
      'label-transform': transformRDFLabel('#')
    });

    statistics.Dashboard.Properties.setState({
      title: 'Properties overview',
      listeners: {
        onShowAsTableClick: showAsTableCb('Properties overview')
      },
      'label-transform': transformRDFLabel('#')
    });
  };

  statistics.initArchives = function () {
    statistics.Archives = {
      Overview: React.render(
        <OverviewSegment />,
        $('#archives-numeric-info').get(0)
      ),
      Contracts: {
        PerYear: React.render(
          <HistogramSegment />,
          $('#archives-contracts-year').get(0)
        ),
        PerRegister: React.render(
          <HistogramSegment />,
          $('#archives-contracts-register').get(0)
        )
      },
      Folia: {
        PerYear: React.render(
          <HistogramSegment />,
          $('#archives-folia-year').get(0)
        ),
        PerRegister: React.render(
          <HistogramSegment />,
          $('#archives-folia-register').get(0)
        )
      }
    };

    statistics.Archives.Overview.setState({
      title: 'Archives overview'
    });

    statistics.Archives.Contracts.PerYear
      .setTitle('Contracts distribution per year')
      .setChartConfig({
        scale: 20
      })
      .setDataProcessors({
        'data-sort' : function (a, b) {
          return parseInt(a.label) - parseInt(b.label);
        }
      })
      .setListeners({
        onBarClick: function (activePoints) {
          if (!activePoints || activePoints.length === 0) return;

          var activeYear = activePoints[0].label.value;
          statistics.emit('onYearBarClick', activeYear);
        },
        onShowAsTableClick: showAsTableCb('Contracts number per year')
      });

    statistics.Archives.Contracts.PerRegister
      .setTitle('Contracts distribution per register')
      .setDataProcessors({
        'data-sort' : function (a, b) {
          return parseInt(a.label) - parseInt(b.label);
        }
      })
      .setFilters({
        'label-transform' : transformRegisterLabel
      })
      .setListeners({
        onShowAsTableClick: showAsTableCb('Contracts number per year')
      });

    statistics.Archives.Folia.PerYear
      .setTitle('Folia distribution per year')
      .setChartConfig({
        scale: 20
      })
      .setDataProcessors({
        'data-sort' : function (a, b) {
          return parseInt(a.label) - parseInt(b.label);
        }
      })
      .setListeners({
        onShowAsTableClick: showAsTableCb('Folia number per year'),
      });

    statistics.Archives.Folia.PerRegister
      .setTitle('Folia distribution per register')
      .setDataProcessors({
        'data-sort' : function (a, b) {
          var regA = parseFloat(a.label.split('_')[1]);
          var regB = parseFloat(b.label.split('_')[1]);

          return regA - regB;
        }
      })
      .setFilters({
        'label-transform' : transformRegisterLabel
      })
      .setListeners({
        onShowAsTableClick: showAsTableCb('Folia number per register')
      });
  };

  statistics.initPeople = function () {
    statistics.People = {
      Overview: React.render(
        <OverviewSegment />,
        $('#people-numeric-info').get(0)
      ),
      Roles: React.render(
        <HistogramSegment />,
        $('#people-roles-mentions').get(0)
      ),
      Mentions: React.render(
        <HistogramSegment />,
        $('#people-mentions-entity').get(0)
      )
    };

    statistics.People.Overview.setState({
      title: 'People overview'
    });

    statistics.People.Roles
      .setTitle('Roles distribution per person mention')
      .setChartConfig({
        fillColor: 'rgba(151,205,187,0.5)',
        highlightFill: 'rgba(151,205,187,0.75)',
        barValueSpacing: 5
      })
      .setFilters({
        'label-transform': transformRDFLabel('#')
      })
      .setListeners({
        onShowAsTableClick: showAsTableCb('Role vs person mention')
      });

    statistics.People.Mentions
      .setTitle('Top mentioned persons')
      .setChartConfig({
        fillColor: 'rgba(151,205,187,0.5)',
        highlightFill: 'rgba(151,205,187,0.75)',
        barValueSpacing: 0
      })
      .setDataProcessors({
        'data-filter': computeTop(0.55)
      })
      .setListeners({
        onBarClick: function (activePoints, metadata) {
          if (!activePoints || activePoints.length === 0) return;

          var activeName = activePoints[0].label;
          var activeMetadata;

          for (var i = 0; i < metadata.length; i++) {
            if (metadata[i].label.value === activeName) {
              activeMetadata = metadata[i];
              break;
            }
          }

          if (!activeMetadata) return console.log('Person not found');
          statistics.emit('onPersonBarClick', activeMetadata.person);
        },
        onShowAsTableClick: showAsTableCb('Person mentions per entity')
      });
  }
})(window.app);
