(function (app) {
  var modal;

  app.React.EntityModal = {
    getInstance: function () {
      if (!modal) modal = new EntityModal();
      return modal;
    }
  };

  var EntityModal = function () {
    this.header = React.render(
      <ModalHeader />,
      $('#entity-modal .header').get(0)
    );

    this.content = React.render(
      <ModalContent />,
      $('#entity-modal .content').get(0)
    );

    $('#entity-modal').modal({
      onHidden: function () {
        modal.history = [];
      }
    });

    this.history = [];
  };

  EntityModal.prototype.show = function (entity) {
    this.history.push(entity);

    this.header.replaceState({
      entity: entity
    });
    this.content.replaceState({
      entity: entity
    });

    $('#entity-modal').modal('show');
    $('#entity-modal .ui.accordion').accordion({
      onOpen: function () {
        $('#entity-modal').modal('refresh');
      }
    });
  };

  EntityModal.prototype.goBack = function () {
    if (modal.history.length === 0) return;

    modal.history.pop();
    var entity = modal.history[modal.history.length - 1];

    modal.header.replaceState({
      entity: entity
    });
    modal.content.replaceState({
      entity: entity
    });
  };

  var ModalHeader = React.createClass({
    getInitialState: function () {
      return {
        entity: null
      };
    },
    render: function () {
      if (!this.state.entity) return (<div></div>);

      var type = this.state.entity.getType();
      switch (type.rdfType) {
        case 'http://128.178.21.39:8080/garzoni/ontology#Person' : {
          return (
            <div></div>
          )
        }
        default : {
          var typeStyles = {
            float: 'right',
            color: type.color
          };
          var btnBackStyle = {
            float: 'left'
          };
          var iStyle = {
            marginRight: 0
          };

          return (
            <div>
              {(function () {
                if (modal.history.length > 1) {
                  return (
                    <button className="ui basic icon button" onClick={modal.goBack} style={btnBackStyle}>
                      <i className="left arrow icon" style={iStyle}></i>
                    </button>
                  )
                }
              })()}
              <span className="text">
                {this.state.entity.getLabel()}
              </span>
              <span style={typeStyles} className="text">
                {type.label}
              </span>
            </div>
          )
        }
      }
    }
  });

  var ModalContent = React.createClass({
    getInitialState: function () {
      return {
        entity: null
      };
    },
    render: function () {
      if (!this.state.entity) return (<div></div>);

      var type = this.state.entity.getType();

      switch (type.rdfType) {
        case 'http://128.178.21.39:8080/garzoni/ontology#Person' : {
          var person = new app.DataModel.Person(this.state.entity);
          return <app.React.PersonIDCard person={person} />
        }
        default : {
          return (
            <div className="row">
              <div className="column">
                <app.React.EntityTable entity={this.state.entity} />
              </div>
            </div>
          )
        }
      }
    }
  });
})(window.app);
