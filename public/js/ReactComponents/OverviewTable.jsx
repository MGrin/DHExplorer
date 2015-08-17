(function (app) {
  app.React.OverviewTable = React.createClass({
    setData: function (data) {
      this.setState({
        data: data
      });
    },
    getInitialState: function () {
      return {
        data: null,
        title: null
      }
    },
    render: function () {
      var that = this;

      var className = 'ui segment basic';
      if (!this.state.data) className += ' loading';

      return (
        <div className="ui center aligned segment">
          <div className="row">
            <h3>
              {this.state.title}
            </h3>
            <div className={className}>
              {(function (state) {
                if (!state.data) return (<div><p></p><p></p></div>)

                return (
                  <table className="ui collapsing celled table">
                    <tbody>
                      {state.data.map(function (el) {
                        return (
                          <tr key={objectHash(el.label + el.value)}>
                            <td>{el.label}</td>
                            <td>{el.value || el.count}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )
              })(this.state)}
            </div>
          </div>
        </div>
      )
    }
  });

  app.React.GraphOverviewTable = React.createClass({
    setData: function (data) {
      this.setState({overview: data});
    },

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
                <table className="ui definition collapsing table">
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
})(window.app);
