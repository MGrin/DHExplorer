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

      console.log(max);
      return function (el) {
        return parseInt(el.value || el.count) > threshold * max;
      };
    };
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
    statistics.ArchivesOverviewSegment = React.render(
      <OverviewSegment />,
      $('#archives-numeric-info').get(0)
    );

    statistics.ArchivesOverviewSegment.setState({
      title: 'Archives overview'
    });

    statistics.ContractsHistYearSegment = React.render(
      <HistogramSegment />,
      $('#archives-contracts-year').get(0)
    );

    statistics.ContractsHistYearSegment.setState({
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

  statistics.initPeople = function () {
    statistics.PeopleOverviewSegment = React.render(
      <OverviewSegment />,
      $('#people-numeric-info').get(0)
    );

    statistics.PeopleOverviewSegment.setState({
      title: 'People overview'
    });

    statistics.RolesHistPersonMention = React.render(
      <HistogramSegment />,
      $('#people-roles-mentions').get(0)
    );

    statistics.RolesHistPersonMention.setState({
      title: 'Roles distribution per person mention',
      showAsTable: showAsTableCb('Role vs person mention'),
      labelMap: transformRDFLabel('#'),
      fillColor: 'rgba(151,205,187,0.5)',
      highlightFill: 'rgba(151,205,187,0.75)',
      barValueSpacing: 5
    });

    statistics.PersonMentionsHistEntity = React.render(
      <HistogramSegment />,
      $('#people-mentions-entity').get(0)
    );

    statistics.PersonMentionsHistEntity.setState({
      title: 'Top mentioned persons',
      showAsTable: showAsTableCb('Person mentions per entity'),
      fillColor: 'rgba(151,205,187,0.5)',
      highlightFill: 'rgba(151,205,187,0.75)',
      barValueSpacing: 0,
      filter: computeTop(0.55),
      onBarClick: function () {
        console.log('clicked');
      }
    });
  }

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
  };

  statistics.updateArchivesOverview = function (data) {
    statistics.ArchivesOverviewSegment.setState({
      data: data
    });
  };

  statistics.updatePeopleOverview = function (data) {
    statistics.PeopleOverviewSegment.setState({
      data: data
    });
  };

  statistics.showRolesPerPersonMention = function (data) {
    statistics.RolesHistPersonMention.setState({
      data: data
    });
  };

  statistics.showPersonMentionPerEntity = function (data) {
    statistics.PersonMentionsHistEntity.setState({
      data: data
    });
  }
})(window.app);
