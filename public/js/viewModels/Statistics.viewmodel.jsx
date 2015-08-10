'use strict';

(function (app) {
  var statistics = app.views.Statistics = {};

  statistics.init = function () {
    statistics.GraphOverviewSegment = React.render(
      <GraphOverviewSegment />,
      $('#graph-overview').get(0)
    );

    statistics.ClassesPropertiesOverviewCharts = React.render(
      <ClassesPropertiesOverviewCharts />,
      $('#classes-properties-overview').get(0)
    );
  };

  statistics.showGraphOverview = function (data) {
    statistics.GraphOverviewSegment.setState({
      overview: data
    });
  };

  statistics.showClassesOverview = function (data) {
    statistics.ClassesPropertiesOverviewCharts.setState({
      classes: data,
      properties: statistics.ClassesPropertiesOverviewCharts.state.properties
    });
  };

  statistics.showPropertiesOverview = function (data) {
    statistics.ClassesPropertiesOverviewCharts.setState({
      classes: statistics.ClassesPropertiesOverviewCharts.state.classes,
      properties: data
    });
  };

  var OverviewChart = React.createClass({
    render: function () {
      return (<canvas></canvas>)
    },
    componentDidMount: function () {
      var that = this;
      for (var key in this.props.data) {
        if (this.props.data[key]) {
          var labelSplit = key.split('#');
          this.props.data[key].label = labelSplit[labelSplit.length - 1];

          this.props.data[key].color = getRandomColor();
        }
      }
      that.chart = new Chart(React.findDOMNode(that).getContext('2d')).Pie(that.props.data);
    }
  });

  var OverviewTable = React.createClass({
    render: function () {
      var data = [];
      var counter = 0;
      for (var key in this.props.data) {
        if (this.props.data[key]) {
          var labelSplit = key.split('#');
          var label = labelSplit[labelSplit.length - 1];
          data.push({label: label, value: this.props.data[key].value, key: counter});
          counter++;
        }
      }

      return (
        <div className="row">
          <div className="column">
            <table className="ui compact celled table">
              <thead>
                <tr>
                  <th className="">Name</th>
                  <th className="descending">Count</th>
                </tr>
              </thead>
              <tbody>
                {data.map(function (el) {
                  return (
                    <tr key={el.counter}>
                      <td>{el.label}</td>
                      <td>{el.value}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )
    }
  });

  var ClassesPropertiesOverviewCharts = React.createClass({
    getInitialState: function () {
      return {
        classes: null,
        properties: null
      }
    },
    showClassesAsTable: function () {
      $('#statistics-modal .header').text('Classes overview');
      React.render(
        <OverviewTable data={this.state.classes} />,
        $('#statistics-modal .content').get(0)
      );
      $('#statistics-modal').modal('show');
    },
    showPropertiesAsTable: function () {
      $('#statistics-modal .header').text('Properties overview');
      React.render(
        <OverviewTable data={this.state.properties} />,
        $('#statistics-modal .content').get(0)
      );
      $('#statistics-modal').modal('show');
    },
    render: function () {
      var classesOverviewClassName = 'ui segment basic';
      if (!this.state.classes) classesOverviewClassName += ' loading';

      var propertiesOverviewClassName = 'ui segment basic';
      if (!this.state.properties) propertiesOverviewClassName += ' loading';

      return (
        <div className="ui center aligned segment">
          <div className="row">
            <h3>
              Classes overview
            </h3>
            <div className={classesOverviewClassName}>
              {(function (state) {
                if (!state.classes) return (<div><p></p><p></p></div>)

                return (<OverviewChart data={state.classes}/>)
              })(this.state)}
            </div>
            <a href="#" onClick={this.showClassesAsTable}>Show as table</a>
          </div>
          <div className="row">
            <h3>
              Properties overview
            </h3>
            <div className={propertiesOverviewClassName}>
              {(function (state) {
                if (!state.properties) return (<div><p></p><p></p></div>)

                return (<OverviewChart data={state.properties}/>)
              })(this.state)}
            </div>
            <a href="#" onClick={this.showPropertiesAsTable}>Show as table</a>
          </div>
        </div>
      )
    }
  });
  var GraphOverviewSegment = React.createClass({
    getInitialState: function () {
      return {
        overview: null
      }
    },
    render: function () {
      var className = 'ui segment basic';
      if (!this.state.overview) className += ' loading';

      var graphNames = [];
      for (var graph in this.state.overview) {
        if (this.state.overview[graph]) {
          graphNames.push(graph);
        }
      }

      return (
        <div className="ui center aligned segment">
          <h1>
            Graph overview
          </h1>
          <div className={className}>
            {(function (overview){
              if (!overview) return (<span className="text">Loading</span>)

              return (
                <table className="ui definition table">
                  <thead>
                    <tr>
                      <th>Graph Name</th>
                      <th>Triples</th>
                      <th>Unique Classes</th>
                      <th>Unique Properties</th>
                      <th>Unique Subjects</th>
                    </tr>
                  </thead>
                  <tbody>
                    {graphNames.map(function (name) {
                      return (
                        <tr key={name}>
                          <td>{name}</td>
                          <td>{overview[name].tripleCount}</td>
                          <td>{overview[name].distinctClassCount}</td>
                          <td>{overview[name].distinctPropertyCount}</td>
                          <td>{overview[name].distinctSubjectCount}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )
            })(this.state.overview)}
          </div>
        </div>
      )
    }
  });

  var getRandomColor = function () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
})(window.app);