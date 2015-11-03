/**
 * React Component used to show a PersonID Card (something like an extension of EntityTable for Person Entity)
 *
 * Created by Nikita Grishin on 08.2015
 */

'use strict';
(function (app, DataModel) {
  app.React.PersonIDCard = React.createClass({
    render: function () {
      var person = this.props.person;
      // console.log(person);

      var personKeys = [];
      for (var k in person) if (person[k] && k !== 'gender' && k !== 'name') personKeys.push(k);

      var avatarSrc;

      switch (person.gender) {
        case 'M' : {
          avatarSrc='/img/avatar_m.png';
          break;
        }
        case 'F' : {
          avatarSrc='/img/avatar_f.png';
          break;
        }
        case 'x' : {
          avatarSrc='/img/avatar_m.png';
          break;
        }
      }

      var genderStr;
      if (person.gender === 'M') genderStr = 'Male';
      if (person.gender === 'F') genderStr = 'Female';
      if (person.gender === 'x') genderStr = 'Unknown';

      // var personHash = objectHash(person);

      return (
        <div className="card">
          <div className="content">
            <div className="description">
              <div className="ui label">{genderStr}</div>
            </div>
            <img className="ui floated right small image" src={avatarSrc}/>
            <div className="ui accordion">
              {personKeys.map(function (key) {
                return (
                  <div key={key}>
                    <div className="title">
                      <i className="dropdown icon"></i>
                      Has <span className="ui label">{person[key].length}</span> {key}
                    </div>
                    <div className="content">
                      <div className="ui list">
                        {person[key].map(function (entity) {
                          return (
                            <a href="#" className="item" key={objectHash(entity)} onClick={app.EntityController.onResourceClick(entity.id)}>
                              {' ' + entity.getLabel()}
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
    },
    componentDidMount: function () {
      $('.ui.accordion').accordion('refresh');
    },
    componentDidUpdate: function () {
      $('.ui.accordion').accordion('refresh');
    }
  });
})(window.app, window.app.DataModel);
