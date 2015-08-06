'use strict';

(function (app) {
  var statistics = app.views.Statistics = {};

  statistics.init = function () {
    statistics.GraphOverviewCard = React.render(
      <GraphOverviewCard />,
      app.dom.statistics.graphOverview.get(0)
    );
  };

  statistics.showGraphOverview = function (data) {
    console.log(data);
    statistics.GraphOverviewCard.setState({
      overview: data
    });
  };

  var CardLoader = React.createClass({
    render: function () {
      return (
        <div className="content">
          <h1>Loading</h1>
        </div>
      )
    }
  });
  var GraphOverviewCard = React.createClass({
    getInitialState: function () {
      return {
        overview: null
      }
    },
    render: function () {
      return (
        <div className="ui card">
          <div className="content">
            <div className="header">
              Graph Overview
            </div>
          </div>
          {(function (that) {
            if (!that.state.overview){
              return (<CardLoader></CardLoader>)
            }

            return (<GraphOverviewTable overview={that.state.overview}></GraphOverviewTable>)

          })(this)}
        </div>
      )
    }
  });

  var GraphOverviewTable = React.createClass({
    render: function () {
      return (
        <div className="content">
          <table className="ui definition table">
            <thead>
              <tr>
                <th>Graph name</th>
                {
                  this.props.overview.graphs.map(function (graph) {
                    return (<th>{graph.name}</th>)
                  })
                }
              </tr>
            </thead>
            <tbody>
              {
                this.props.overview.values.map(function (value) {
                  return (
                    <tr>
                      <td>{value.label}</td>
                      {
                        this.props.overview.graphs.map(function (graph) {
                          return (<td>{graph.value.key}</td>)
                        })
                      }
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      )
    }
  });
})(window.app);