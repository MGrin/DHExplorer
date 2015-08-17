(function (app) {
  app.React.ChartHeader = React.createClass({
    render: function () {
      var btnSaveStyle = {
        float: 'right'
      };
      var btnBackStyle = {
        float: 'left'
      };
      var iStyle = {
        marginRight: 0
      };
      return (
        <div className="ui header">
          <h3>
            {(function (that) {
              if (!that.props.showGoBackBtn) return;

              return (
                <button className="ui basic icon button" onClick={that.props.goBack} style={btnBackStyle}>
                  <i className="left arrow icon" style={iStyle}></i>
                </button>
              )
            })(this)}
            {this.props.title}
            <button className="ui basic icon button" onClick={this.props.saveImage} style={btnSaveStyle}>
              <i className="save icon" style={iStyle}></i>
            </button>
          </h3>
        </div>
      )
    }
  });
})(window.app);
