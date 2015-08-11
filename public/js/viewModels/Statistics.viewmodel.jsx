'use strict';

(function (app) {
  var statistics = app.views.Statistics = {};

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
      showAsTable: function () {
        $('#statistics-modal .header').text('Classes overview');
        React.render(
          <OverviewTable data={statistics.ClassesOverviewSegment.state.data} />,
          $('#statistics-modal .content').get(0)
        );
        $('#statistics-modal').modal('show');
      }
    });

    statistics.PropertiesOverviewSegment = React.render(
      <PieSegment />,
      $('#properties-overview').get(0)
    );

    statistics.PropertiesOverviewSegment.setState({
      data: statistics.PropertiesOverviewSegment.state.data,
      title: 'Properties overview',
      showAsTable: function () {
        $('#statistics-modal .header').text('Properties overview');
        React.render(
          <OverviewTable data={statistics.PropertiesOverviewSegment.state.data} />,
          $('#statistics-modal .content').get(0)
        );
        $('#statistics-modal').modal('show');
      }
    });
  };

  statistics.initArchives = function () {
    statistics.ContractsHistYearSegment = React.render(
      <HistogramSegment />,
      $('#archives-contracts-year').get(0)
    );

    statistics.ContractsHistYearSegment.setState({
      data: statistics.ContractsHistYearSegment.state.data,
      title: 'Contracts distribution per year'
    });

    statistics.ContractsHistRegisterSegment = React.render(
      <HistogramSegment />,
      $('#archives-contracts-register').get(0)
    );

    statistics.ContractsHistRegisterSegment.setState({
      data: statistics.ContractsHistRegisterSegment.state.data,
      title: 'Contracts distribution per register'
    });

    statistics.FoliaHistYearSegment = React.render(
      <HistogramSegment />,
      $('#archives-folia-year').get(0)
    );

    statistics.FoliaHistYearSegment.setState({
      data: statistics.FoliaHistYearSegment.state.data,
      title: 'Folia distribution per year'
    })

    statistics.FoliaHistRegisterSegment = React.render(
      <HistogramSegment />,
      $('#archives-folia-register').get(0)
    );

    statistics.FoliaHistRegisterSegment.setState({
      data: statistics.FoliaHistRegisterSegment.state.data,
      title: 'Folia distribution per register'
    });
  };

  statistics.showGraphOverview = function (data) {
    statistics.GraphOverviewSegment.setState({
      overview: data
    });
  };

  statistics.showClassesOverview = function (data) {
    statistics.ClassesOverviewSegment.setState({
      data: data,
      title: statistics.ClassesOverviewSegment.state.title,
      showAsTable: statistics.ClassesOverviewSegment.state.showAsTable
    });
  };

  statistics.showPropertiesOverview = function (data) {
    statistics.PropertiesOverviewSegment.setState({
      data: data,
      title: statistics.PropertiesOverviewSegment.state.title,
      showAsTable: statistics.PropertiesOverviewSegment.state.showAsTable
    });
  };

  statistics.showContractsPerYear = function (data) {
    statistics.ContractsHistYearSegment.setState({
      title: statistics.ContractsHistYearSegment.state.title,
      data: data,
      scale: 20,
      'sort-labels': function (a, b) {
        return parseInt(a.label) - parseInt(b.label);
      },
    });
  };

  statistics.showContractsPerRegister = function (data) {
    statistics.ContractsHistRegisterSegment.setState({
      title: statistics.ContractsHistRegisterSegment.state.title,
      data: data,
      'sort-labels': function (a, b) {
        var regA = parseFloat(a.label.split('_')[1]);
        var regB = parseFloat(b.label.split('_')[1]);

        return regA - regB;
      },
    });
  };

  statistics.showFoliaPerYear = function (data) {
    statistics.FoliaHistYearSegment.setState({
      title: statistics.FoliaHistYearSegment.state.title,
      data: data,
      scale: 20,
      'sort-labels': function (a, b) {
        return parseInt(a.label) - parseInt(b.label);
      },
    });
  };

  statistics.showFoliaPerRegister = function (data) {
    statistics.FoliaHistRegisterSegment.setState({
      title: statistics.FoliaHistRegisterSegment.state.title,
      data: data,
      'sort-labels': function (a, b) {
        var regA = parseFloat(a.label.split('_')[1]);
        var regB = parseFloat(b.label.split('_')[1]);

        return regA - regB;
      },
    });
  }
})(window.app);