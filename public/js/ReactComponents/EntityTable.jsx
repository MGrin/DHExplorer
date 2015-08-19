(function (app) {
  app.React.EntityTable = React.createClass({
    render: function () {
      var entity = this.props.entity;
      var directPredicates = {};
      var reversedPredicates = {};

      for (var predicateId in entity.objects) {
        if (entity.objects[predicateId]) {
          var label = app.React.helpers.transformRDFLabel('#')(entity.predicates[predicateId].value);

          if (!directPredicates[label]) directPredicates[label] = {
            label: label,
            content: []
          };

          var en = app.Storage.Entity.get(entity.objects[predicateId]);
          if (!en) continue;

          directPredicates[label].content.push(en);
        }
      }

      for (var predicateId in entity.origins) {
        if (entity.origins[predicateId]) {
          var label = app.React.helpers.transformRDFLabel('#')(entity.predicates[predicateId].value);
          if (!reversedPredicates[label]) reversedPredicates[label] = {
            label: label,
            content: []
          }

          var en = app.Storage.Entity.get(entity.origins[predicateId]);
          if (!en) continue;

          reversedPredicates[label].content.push(en);
        }
      }

      var directPredicatesArr = [];
      var reversedPredicatesArr = [];

      for (var p in directPredicates) {
        if (directPredicates[p]) {
          directPredicatesArr.push(directPredicates[p])
        }
      }
      for (var p in reversedPredicates) {
        if (reversedPredicates[p]) {
          reversedPredicatesArr.push(reversedPredicates[p])
        }
      }
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
              {directPredicatesArr.map(function (predicate) {
                return (
                  <tr key={'direct_' + predicate.label}>
                    <td>{predicate.label}</td>
                    <td>
                      <div className="ui list">
                        {predicate.content.map(function (object) {
                          if (object.isLiteral()) {
                            return (
                              <div className="item" key={'direct_literal_' + object.id}>{object.getLabel()}</div>
                            );
                          } else {
                            return (
                              <a className="item" href="#" key={'direct_composed_' + object.id} onClick={app.EntityController.onResourceClick(object.id)}>
                                {object.getLabel()}
                              </a>
                            );
                          }
                        })}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="ui styled fluid accordion">
            <div className="title">
              <i className="dropdown icon"></i>
              Reversed relations
            </div>
            <div className="content">
              <table className="ui stripped table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Predicate</th>
                  </tr>
                </thead>
                <tbody>
                  {reversedPredicatesArr.map(function (predicate) {
                    return (
                      <tr key={'reversed_' + predicate.label}>
                        <td>{predicate.label}</td>
                        <td>
                          <div className="ui list">
                            {predicate.content.map(function (origin) {
                              if (origin.isLiteral()) {
                                return (
                                  <div className="item" key={'reversed_literal_' + origin.id}>{origin.getLabel()}</div>
                                );
                              } else {
                                return (
                                  <a className="item" href="#" key={'reversed_composed_' + origin.id} onClick={app.EntityController.onResourceClick(origin.id)}>
                                    {origin.getLabel()}
                                  </a>
                                );
                              }
                            })}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
  });
})(window.app);
