(function (app) {
  app.React.HistogramTable = React.createClass({
    render: function () {
      this.props.data.sort(function (a, b) {
        var va = parseInt(a.value || a.count);
        var vb = parseInt(b.value || b.count);

        return vb - va;
      });
      return (
        <div className="row">
          <div className="column">
            <table className="ui celled table">
              <thead>
                <tr>
                  <th className="">Name</th>
                  <th className="descending">Count</th>
                </tr>
              </thead>
              <tbody>
                {this.props.data.map(function (el) {
                  return (
                    <tr key={objectHash(el.label + " " + el.value || el.count)}>
                      <td>{el.label}</td>
                      <td>{el.value || el.count}</td>
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
})(window.app);
