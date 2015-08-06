'use strict';

(function (app) {
  var scope = app.views.Entity = {};
  console.log('Entity viewmodel loaded');
  
  var entitiesPerPage = 30;

  var entityPredicate = function (entity) {
    return entity.variable ? true : false;
  };

  scope.open = function (cb) {
    scope.list = React.render(
      <EntitiesView />,
      app.dom.entity.get(0)
    );

    return;
  };

  scope.update = function () {
    if (!scope.list) {
      scope.list = React.render(
        <EntitiesView />,
        app.dom.entity.get(0)
      );
    }
    scope.list.setState({
      page: 0,
      entities: app.Storage.Entity.getArray(entitiesPerPage, 0, entityPredicate)
    });
  };

  scope.renderModalWindow = function () {
    scope.entityModal = {
      header: React.render(
                <EntityModalHeader />,
                $('#entity-modal .header').get(0)
              ),
      content: React.render(
                  <EntityModalContent />,
                  $('#entity-modal .content').get(0)
                )
    };
  };

  scope.history = [];

  scope.setModalEntity = function (entity) {
    if (!scope.entityModal) {
      scope.renderModalWindow();
    }

    if (scope.history.length === 0 || scope.history[scope.history.length - 1].id !== entity.id) scope.history.push(entity);

    scope.entityModal.header.setState({
      entity: entity
    });
    scope.entityModal.content.setState({
      entity: entity
    });
  };

  scope.showPreviousEntity = function () {
    scope.history.pop()
    scope.setModalEntity(scope.history.pop());
  };

  var EntityModalHeader = React.createClass({
    getInitialState: function () {
      return {
        entity: null
      }
    },
    render: function () {
      if (!this.state.entity) {
        return (
          <div></div>
        );
      }

      var type = app.Storage.NodeType.get(this.state.entity.type);

      var typeStyles = {
        float: 'right',
        color: type.color
      };

      return (
        <div>
          {(function () {
            if (scope.history.length > 1) {
              return (
                <div className="ui icon button" onClick={scope.showPreviousEntity}>
                  <i className="left arrow icon" />
                </div>
              );
            }
          })()}         
          <span className="text">
            {this.state.entity ? this.state.entity.getLabel() : ''}
          </span>
          <span style={typeStyles} className="text">
            {type.label}
          </span>
        </div>
      );
    }
  });

  var EntityModalContent = React.createClass({
    getInitialState: function () {
      return {
        entity: null
      }
    },
    render: function () {
      if (!this.state.entity) {
        return (
          <div></div>
        );
      }

      return (
        <div className="row">
          <div className="column">
            <EntityView entity={this.state.entity} />
          </div>
        </div>
      );
    }
  });

  var EntityView = React.createClass({
    render: function () {
      var entity = this.props.entity;

      if (entity.isLiteral()) {
        return (
          <LiteralEntityView entity={entity} />
        );
      } else {
        return (
          <CompositEntityView entity={entity} />
        );
      }
    }
  });

  var LiteralEntityView = React.createClass({
    render: function () {
      var entity = this.props.entity;
      return (
        <div>
          <span className="text">A literal entity.</span>

          {(function (entity) {
            if (entity.tuple.datatype) {
              return (
                <p className="text">
                  <span className="text">Type:
                    <a target="_blank" href={entity.tuple.datatype}>
                      {entity.tuple.datatype}
                    </a>
                  </span>
                </p>
              );
            }
          })(this.props.entity)}

          {
            this.props.entity.originsAsArray().map(function (origin) {
              var predicateLabel = origin.predicate.value.split('#');
              predicateLabel = predicateLabel[predicateLabel.length - 1];

              return (
                <p className="text" key={origin.source.id}>
                  Is <b>{predicateLabel}</b> for <a href="#" onClick={app.EntityController.onResourceClick(origin.source.id)}> {origin.source.getLabel()}</a>
                </p>
              );
            })
          }
        </div>
      );
    }
  });

  var CompositEntityView = React.createClass({
    render: function () {
      var entity = this.props.entity;
      return (
        <div>
          <table className="ui stripped table">
            <thead>
              <tr>
                <th>Predicate</th>
                <th>Object</th>
              </tr>
            </thead>
            <tbody>
              {entity.subjectsAsArray().map(function (subject) {
                var predicateLabel = subject.predicate.value.split('#');
                predicateLabel = predicateLabel[predicateLabel.length - 1];

                return (
                  <tr key={subject.object.id}>
                    <td>
                      {predicateLabel}
                    </td>
                    <td>
                      {(function () {
                        if (subject.object.isLiteral()) {
                          return (
                            <div className="text">{subject.object.getLabel()}</div>
                          );
                        } else {
                          return (
                            <a href="#" onClick={app.EntityController.onResourceClick(subject.object.id)}>
                              {subject.object.getLabel()}
                            </a>
                          );
                        }
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <table className="ui stripped table">
            <thead>
              <tr>
                <th>Predicate</th>
                <th>Object</th>
              </tr>
            </thead>
            <tbody>
              {entity.originsAsArray().map(function (origin) {
                var predicateLabel = origin.predicate.value.split('#');
                predicateLabel = predicateLabel[predicateLabel.length - 1];

                return (
                  <tr key={origin.source.id}>
                    <td>
                      {predicateLabel}
                    </td>
                    <td>
                      {(function () {
                        if (origin.source.isLiteral()) {
                          return (
                            <div className="text">{origin.source.getLabel()}</div>
                          );
                        } else {
                          return (
                            <a href="#" onClick={app.EntityController.onResourceClick(origin.source.id)}>
                              {origin.source.getLabel()}
                            </a>
                          );
                        }
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
  });

  var EntitiesView = React.createClass({
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
          <EntitiesTable entities={this.state.entities}></EntitiesTable>
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
      )
    }
  });

  var EntitiesTable = React.createClass({
    render: function () {
      return (
        <table className="table stripped ui">
          <thead>
            <tr>
              <th> {app.QueryController.query} </th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.entities.map(function (entity) {
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
      );
    }
  });
})(window.app);