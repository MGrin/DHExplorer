(function (app) {
  app.React.EntitiesList = React.createClass({
    getInitialState: function () {
      return {
        page: 0,
        entities: app.Storage.Entity.getArray(entitiesPerPage, 0, entityPredicate)
      }
    },
    previousPage: function () {
      var state = this.state;
      if (state.page === 0) return;

      this.setState({
        page: state.page-1,
        entities: app.Storage.Entity.getArray(entitiesPerPage, (state.page-1)* entitiesPerPage, entityPredicate)
      });
      $('#entity-container').scrollTop(0);
    },
    nextPage: function () {
      var state = this.state;
      if (app.Storage.Entity.size() < entitiesPerPage * (state.page + 1)) return;

      this.setState({
        page: state.page+1,
        entities: app.Storage.Entity.getArray(entitiesPerPage, (state.page+1) * entitiesPerPage, entityPredicate)
      });
      $('#entity-container').scrollTop(0);
    },
    render: function () {
      var numberOfPages = Math.ceil(app.Storage.Entity.size() / entitiesPerPage);

      return (
        <div>
          <table className="table stripped ui collapsing">
            <thead>
              <tr>
                <th> {app.QueryController.query} </th>
              </tr>
            </thead>
            <tbody>
              {
                this.props.state.map(function (entity) {
                  return (<tr key={entity.id}>
                          <td className="entityLine">
                            <a href="#" onClick={app.EntityController.onResourceClick(entity.id)}>{entity.getLabel()}</a>
                            <div className="text">{entity.variable}</div>
                          </td>
                        </tr>
                  );
                })
              }
            </tbody>
          </table>
          {(function (that) {
            if (numberOfPages > 1) {
              return (
                <div className="ui one column stackable center aligned page grid message">
                  {(function (that) {
                    if (that.state.page > 0) {
                      return (
                        <div className="ui animated secondary button" onClick={that.previousPage}>
                          <div className="visible content"> Previous </div>
                          <div className="hidden content">
                            <i className="left arrow icon" />
                          </div>
                        </div>
                      );
                    }
                  })(that)}
                  {(function (that) {
                    if (app.Storage.Entity.size() > entitiesPerPage * (that.state.page + 1)) {
                      return (
                        <div className="ui animated secondary button" onClick={that.nextPage}>
                          <div className="visible content"> Next </div>
                          <div className="hidden content">
                            <i className="right arrow icon" />
                          </div>
                        </div>
                      );
                    }
                  })(that)}
                </div>
              )
            }
          })(this)}
        </div>
      );
    }
  });
})(window.app);
