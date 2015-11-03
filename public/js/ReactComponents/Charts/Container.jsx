/**
 * React Component holding all statistical charts
 *
 * Created by Nikita Grishin on 08.2015
 */

'use strict';

(function (app) {
  app.React.ChartsContainer = React.createClass({
    setView: function (view) {
      this.setState({view: view});
    },
    getInitialState: function () {
      return {};
    },
    render: function () {
      if (!this.state.view) return (<div>Loading</div>);

      return (
        <div className="ui grid">
          <div className="ui stackable centered container two column width equal height grid">
            {this.props.charts[this.state.view].map(function (chart, index) {
              return (<div className="column" key={chart.title}>
                <app.React.Chart chart={chart} />
              </div>)
            })}
          </div>
        </div>
      )
    }
  });
})(window.app);
