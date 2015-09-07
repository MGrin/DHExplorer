(function (app, DataModel) {
  app.React.PersonIDCard = React.createClass({
    render: function () {
      var person = this.props.person;
      // console.log(person);

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

      return (
        <div className="card">
          <div className="content">
            <img className="left floated ui small image" src={avatarSrc} />
            <div className="description">
              <div className="ui label">{genderStr}</div>
            </div>
            {DataModel.constants.familyRelations.map(function (relation) {
              if (person.family[relation]) {
                return <FamilyRelation key={'relation_' + relation + '_' + objectHash(person.family[relation])} relation={relation} values={person.family[relation]} />
              }
            })}
            <div className="ui accordion">
              <div className="title">
                <i className="dropdown icon"></i>
                Has <span className="ui label">{person.mentions.length}</span> mentions
              </div>
              <div className="content">
                <div className="ui list">
                  {person.mentions.map(function (mention) {
                    return (
                      <a href="#" className="item" key={objectHash(mention)} onClick={app.EntityController.onResourceClick(mention.id)}>
                        {' ' + mention.getLabel()}
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  });

  var FamilyRelation = React.createClass({
    render: function () {
      var relation = this.props.relation;
      var values = this.props.values;

      var relationLabel = relation.replace(/_/g, ' ');
      relationLabel = relationLabel.substring(0, 1).toUpperCase() + relationLabel.substring(1) + ': ';

      return (
        <div className="text">
          {relationLabel}
          {values.map(function (v) {
            return (
              <a href="#" key={objectHash(v)} onClick={app.EntityController.onResourceClick(v.id)}>
                {' ' + v.getLabel()}
              </a>
            )
          })}
        </div>
      )
    }
  })
})(window.app, window.app.DataModel);
