(function (app, DataModel) {
  app.React.PersonIDCard = React.createClass({
    render: function () {
      var person = this.props.person;

      var avatarSrc;

      switch (person.gender) {
        case 'M' : {
          avatarSrc='/img/avatar_m.png';
          break;
        }
        case 'F' : {
          avatarSrc='/img/avatar_f.pmg';
          break;
        }
      }
      return (
        <div className="card">
          <div className="content">
            <img className="left floated ui small image" src={avatarSrc} />
            <div className="header">
              {person.name}
            </div>
          </div>
        </div>
      )
    }
  });
})(window.app, window.app.DataModel);
