/**
 * React Component used to show Entities in list (on the Entity view)
 *
 * Created by Nikita Grishin on 08.2015
 */

'use strict';
(function (app) {
  app.React.QueryVariablesMenu = React.createClass({
    getInitialState: function () {
      return {
        variables: null,
        onClick: null
      }
    },
    render: function () {
      if (!this.state.variables) return (<div></div>);

      var onClick = this.state.onClick;

      return (
        <div className="field">
          <label>Variables</label>
          <div className="ui vertical menu">
            {this.state.variables.map(function (v, i) {
              var classes = "ui teal item variable " + v.label;
              if (i === 0) classes += " active";
              return (
                <a className={classes} key={objectHash(v)} onClick={onClick(v)}>
                  {v.label}
                  <div className="ui teal pointing left label">{v.count}</div>
                </a>
              )
            })}
          </div>
        </div>
      );
    }
  });

  app.React.EntitiesList = React.createClass({
    getInitialState: function () {
      var that = this;
      return {
        query: null,
        page: 0,
        entitiesPerPage: 30,
        numberOfPages: null,
        predicate: null
      };
    },
    previousPage: function () {
      if (this.state.page === 0) return;

      this.setState({
        page: this.state.page - 1
      });
      $('#entity-container').scrollTop(0);
    },
    nextPage: function () {
      if (this.state.page === this.state.numberOfPages) return;

      this.setState({
        page: this.state.page + 1,
      });
      $('#entity-container').scrollTop(0);
    },
    render: function () {
      var that = this;

      var entities;

      var query;

      query = this.state.query;
      if (!query) return <EntitiesInformationCard />

      var entities = app.Storage.Entity.getArray(this.state.entitiesPerPage, this.state.page, this.state.predicate);

      return (
        <div>
          <table className="table stripped ui">
            <thead>
              <tr>
                <th className="center aligned"> {query} </th>
              </tr>
            </thead>
            <tbody>
              {
                entities.map(function (entity) {
                  return (<tr key={entity.id}>
                          <td className="entityLine">
                            <a href="#" onClick={that.state.onResourceClick(entity.id)}>{entity.getLabel()}</a>
                            <div className="text">{entity.variable}</div>
                          </td>
                        </tr>
                  );
                })
              }
            </tbody>
          </table>
          {(function (that) {
            if (that.state.numberOfPages > 1) {
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
                  <span className="text">Page {that.state.page + 1} of {that.state.numberOfPages}</span>
                  {(function (that) {
                    if (that.state.page < that.state.numberOfPages) {
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

  var EntitiesInformationCard = React.createClass({
    render: function () {
      return (
        <div className="ui card">
          <div className="content">
            <div className="header">
              Entity Viewer
            </div>
            <div className="meta">
              Data Explorer
            </div>
            <div className="description">
              Write your query and inspect results
            </div>
          </div>
        </div>
      );
    }
  });
})(window.app);
