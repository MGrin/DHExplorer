'use strict';

(function (app) {
  var statistics = app.views.Statistics = {};

  statistics.listeners = {};
  statistics.registerListener = function (name, fn) {
    if (!statistics.listeners[name]) statistics.listeners[name] = [];
    statistics.listeners[name].push(fn);
  };
  statistics.emit = function (name, data) {
    if (!statistics.listeners[name]) return;

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
        <app.React.GraphOverviewTable />,
        $('#graph-overview').get(0)
      ),
      Classes: React.render(
        <app.React.PieChart />,
        $('#classes-overview').get(0)
      ),
      Properties: React.render(
        <app.React.PieChart />,
        $('#properties-overview').get(0)
      )
    };

    statistics.Dashboard.Classes.setState({
      title: 'Classes overview',
      listeners: {
        onShowAsTableClick: app.React.helpers.showAsTableCb('Classes overview'),
        onSaveAsImageClick: app.React.helpers.saveAsImage
      },
      'label-transform': app.React.helpers.transformRDFLabel('#')
    });

    statistics.Dashboard.Properties.setState({
      title: 'Properties overview',
      listeners: {
        onShowAsTableClick: app.React.helpers.showAsTableCb('Properties overview'),
        onSaveAsImageClick: app.React.helpers.saveAsImage
      },
      'label-transform': app.React.helpers.transformRDFLabel('#')
    });
  };

  statistics.initArchives = function () {
    statistics.Archives = {
      Overview: React.render(
        <app.React.OverviewTable />,
        $('#archives-numeric-info').get(0)
      ),
      Contracts: {
        PerDate: React.render(
          <app.React.HistogramChart />,
          $('#archives-contracts-year').get(0)
        ),
        PerRegister: React.render(
          <app.React.HistogramChart />,
          $('#archives-contracts-register').get(0)
        )
      },
      Folia: {
        PerDate: React.render(
          <app.React.HistogramChart />,
          $('#archives-folia-year').get(0)
        ),
        PerRegister: React.render(
          <app.React.HistogramChart />,
          $('#archives-folia-register').get(0)
        )
      }
    };

    statistics.Archives.Overview.setState({
      title: 'Archives overview'
    });

    statistics.Archives.Contracts.PerDate
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
        onBarClick: app.React.helpers.onBarClick('onYearBarClick', statistics.emit, {source: statistics.Archives.Contracts.PerDate, type: 'Contracts'}),
        onShowAsTableClick: app.React.helpers.showAsTableCb('Contracts number per year'),
        onSaveAsImageClick: app.React.helpers.saveAsImage
      })
      .apply();

    statistics.Archives.Contracts.PerRegister
      .setTitle('Contracts distribution per register')
      .setDataProcessors({
        'data-sort' : function (a, b) {
          return parseInt(a.label) - parseInt(b.label);
        }
      })
      .setFilters({
        'label-transform' : app.React.helpers.transformRegisterLabel
      })
      .setListeners({
        onShowAsTableClick: app.React.helpers.showAsTableCb('Contracts number per year'),
        onSaveAsImageClick: app.React.helpers.saveAsImage
      })
      .apply();

    statistics.Archives.Folia.PerDate
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
        onBarClick: app.React.helpers.onBarClick('onYearBarClick', statistics.emit, {source: statistics.Archives.Folia.PerDate, type: 'Folia'}),
        onShowAsTableClick: app.React.helpers.showAsTableCb('Folia number per year'),
        onSaveAsImageClick: app.React.helpers.saveAsImage
      })
      .apply();

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
        'label-transform' : app.React.helpers.transformRegisterLabel
      })
      .setListeners({
        onShowAsTableClick: app.React.helpers.showAsTableCb('Folia number per register'),
        onSaveAsImageClick: app.React.helpers.saveAsImage
      })
      .apply();
  };

  statistics.initPeople = function () {
    statistics.People = {
      Overview: React.render(
        <app.React.OverviewTable />,
        $('#people-numeric-info').get(0)
      ),
      Roles: React.render(
        <app.React.HistogramChart />,
        $('#people-roles-mentions').get(0)
      ),
      Mentions: React.render(
        <app.React.HistogramChart />,
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
        'label-transform': app.React.helpers.transformRDFLabel('#')
      })
      .setListeners({
        onShowAsTableClick: app.React.helpers.showAsTableCb('Role vs person mention'),
        onSaveAsImageClick: app.React.helpers.saveAsImage
      })
      .apply();

    statistics.People.Mentions
      .setTitle('Top mentioned persons')
      .setChartConfig({
        fillColor: 'rgba(151,205,187,0.5)',
        highlightFill: 'rgba(151,205,187,0.75)',
        barValueSpacing: 0
      })
      .setDataProcessors({
        'data-filter': app.React.helpers.computeTop(0.55)
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
        onShowAsTableClick: app.React.helpers.showAsTableCb('Person mentions per entity'),
        onSaveAsImageClick: app.React.helpers.saveAsImage
      })
      .apply();
  }
})(window.app);
