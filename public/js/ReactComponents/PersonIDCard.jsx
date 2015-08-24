(function (app) {
  app.React.PersonIDCard = React.createClass({
    render: function () {
      var entity = this.props.entity;

      return <div>{JSON.stringify(entity)}</div>
    }
  });
})(window.app);
