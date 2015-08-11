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
    }
  };

  statistics.initDashboard = function () {
    statistics.GraphOverviewSegment = React.render(
      <GraphOverviewSegment />,
      $('#graph-overview').get(0)
    );

    statistics.ClassesOverviewSegment = React.render(
      <PieSegment />,
      $('#classes-overview').get(0)
    );

    statistics.ClassesOverviewSegment.setState({
      data: statistics.ClassesOverviewSegment.state.data,
      title: 'Classes overview',
      showAsTable: showAsTableCb('Classes overview'),
      labelMap: transformRDFLabel('#')
    });

    statistics.PropertiesOverviewSegment = React.render(
      <PieSegment />,
      $('#properties-overview').get(0)
    );

    statistics.PropertiesOverviewSegment.setState({
      data: statistics.PropertiesOverviewSegment.state.data,
      title: 'Properties overview',
      showAsTable: showAsTableCb('Properties overview'),
      labelMap: transformRDFLabel('#')
    });
  };

  statistics.initArchives = function () {
    statistics.ContractsHistYearSegment = React.render(
      <HistogramSegment />,
      $('#archives-contracts-year').get(0)
    );

    statistics.ContractsHistYearSegment.setState({
      data: statistics.ContractsHistYearSegment.state.data,
      title: 'Contracts distribution per year',
      showAsTable: showAsTableCb('Contracts number per year'),
      scale: 20,
      'sort-labels': function (a, b) {
        return parseInt(a.label) - parseInt(b.label);
      }
    });

    statistics.ContractsHistRegisterSegment = React.render(
      <HistogramSegment />,
      $('#archives-contracts-register').get(0)
    );

    statistics.ContractsHistRegisterSegment.setState({
      data: statistics.ContractsHistRegisterSegment.state.data,
      title: 'Contracts distribution per register',
      showAsTable: showAsTableCb('Contracts number per register'),
      labelMap: transformRegisterLabel,
      'sort-labels': function (a, b) {
        var regA = parseFloat(a.label.split('_')[1]);
        var regB = parseFloat(b.label.split('_')[1]);

        return regA - regB;
      }
    });

    statistics.FoliaHistYearSegment = React.render(
      <HistogramSegment />,
      $('#archives-folia-year').get(0)
    );

    statistics.FoliaHistYearSegment.setState({
      data: statistics.FoliaHistYearSegment.state.data,
      title: 'Folia distribution per year',
      showAsTable: showAsTableCb('Folia number per year'),
      scale: 20,
      'sort-labels': function (a, b) {
        return parseInt(a.label) - parseInt(b.label);
      }
    })

    statistics.FoliaHistRegisterSegment = React.render(
      <HistogramSegment />,
      $('#archives-folia-register').get(0)
    );

    statistics.FoliaHistRegisterSegment.setState({
      data: statistics.FoliaHistRegisterSegment.state.data,
      title: 'Folia distribution per register',
      showAsTable: showAsTableCb('Folia number per register'),
      labelMap: transformRegisterLabel,
      'sort-labels': function (a, b) {
        var regA = parseFloat(a.label.split('_')[1]);
        var regB = parseFloat(b.label.split('_')[1]);

        return regA - regB;
      }
    });
  };

  statistics.showGraphOverview = function (data) {
    statistics.GraphOverviewSegment.setState({
      overview: data
    });
  };

  statistics.showClassesOverview = function (data) {
    statistics.ClassesOverviewSegment.setState({
      data: data
    });
  };

  statistics.showPropertiesOverview = function (data) {
    statistics.PropertiesOverviewSegment.setState({
      data: data
    });
  };

  statistics.showContractsPerYear = function (data) {
    statistics.ContractsHistYearSegment.setState({
      data: data
    });
  };

  statistics.showContractsPerRegister = function (data) {
    statistics.ContractsHistRegisterSegment.setState({
      data: data
    });
  };

  statistics.showFoliaPerYear = function (data) {
    statistics.FoliaHistYearSegment.setState({
      data: data      
    });
  };

  statistics.showFoliaPerRegister = function (data) {
    statistics.FoliaHistRegisterSegment.setState({
      data: data
    });
  }
})(window.app);