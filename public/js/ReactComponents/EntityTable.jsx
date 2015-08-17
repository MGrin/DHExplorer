(function (app) {
  app.React.EntityTable = React.createClass({
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
})(window.app);
