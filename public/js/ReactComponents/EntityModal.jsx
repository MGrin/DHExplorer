(function (app) {
  app.React.EntityModal = React.createClass({
    getInitialState: function () {
      return {
        entity: null
      }
    },
    render: function () {
      if (!this.state.entity) return (<div></div>)

      var type = app.Storage.NodeType.get(this.state.entity.type);

      var typeStyles = {
        float: 'right',
        color: type.color
      };

      return (
        <div className="ui modal">
          <i className="close icon"></i>
          <div className="header">
            <span className="text">
              {this.state.entity.getLabel()}
            </span>
            <span style={typeStyles} className="text">
              {type.label}
            </span>
          </div>
          <div className="content ui grid container">
            <div className="row">
              <div className="column">
                <app.React.EntityTable entity={this.state.entity} />
              </div>
            </div>
          </div>
        </div>
      )
    }
  });
})(window.app);

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

    // {(function () {
        //   if (scope.history.length > 1) {
        //     return (
        //       <div className="ui icon button" onClick={scope.showPreviousEntity}>
        //         <i className="left arrow icon" />
        //       </div>
        //     );
        //   }
        // })()}
    return (
      <div>
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
