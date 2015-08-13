var entitiesPerPage = 30;
var entityPredicate = function (entity) {
  return entity.variable ? true : false;
};

var saveAsImage = function (node) {
  return function () {
    var n = $(React.findDOMNode(node));
    var dataUrl;
    n.find('canvas').each(function () {
      dataUrl = $(this).get(0).toDataURL('image/png');
    });
    window.open(dataUrl);
  };
};

Chart.defaults.global.responsive = true;

// Chart.js components
var HistogramChart = React.createClass({
  render: function () {
    return (<canvas/>)
  },
  componentDidMount: function () {
    var that = this;

    var labels = that.props.labels;

    if (that.props.scale && labels.length > that.props.scale) {
      var downsampleRate = Math.ceil(labels.length / that.props.scale);

      labels = labels.map(function (el, index) {
        if (index % downsampleRate === 0) return el;
        return '';
      });
    }

    var fillColor = that.props.fillColor || 'rgba(151,187,205,0.5)';
    var highlightFill = that.props.highlightFill || 'rgba(151,187,205,0.75)';

    var data = {
      labels: labels,
      datasets: [{
        fillColor: fillColor,
        highlightFill: highlightFill,
        data: that.props.values,
        metadata: that.props.metadata
      }]
    };

    var maxValue = -1;

    that.props.values.map(function (el) {
      if (el > maxValue) maxValue = el;
    });

    var chartConfig = {
      barStrokeWidth : 0,
      barValueSpacing : that.props.barValueSpacing || 1,
      scaleOverride : true,
      scaleSteps : 10,
      scaleStepWidth : Math.ceil(maxValue / 10),
      scaleStartValue : 0
    };

    setTimeout(function () {
      that.chart = new Chart(React.findDOMNode(that).getContext('2d')).Bar(data, chartConfig);
      if (that.props.onBarClick) {
        that.chart.chart.canvas.onclick = function (e) {
          var activePoints = that.chart.getBarsAtEvent(e);
          console.log(activePoints);
        };
      }
    }, 1000);
  }
});

var PieChart = React.createClass({
  render: function () {
    return (<canvas />)
  },
  componentDidMount: function () {
    var that = this;
    that.chart = new Chart(React.findDOMNode(that).getContext('2d')).Doughnut(that.props.data);
  }
});

// Segments components
var HistogramSegment = React.createClass({
  getInitialState: function () {
    return {
      title: null,
      data: null,
      labelMap: null,
      fillColor: null,
      highlightFill: null,
      barValueSpacing: null,
      filter: null,
      onBarClick: null
    }
  },
  render: function () {
    var that = this;

    var className = 'ui segment basic';
    if (!this.state.data) className += ' loading';

    var data = this.state.data;
    var labels;
    var values;
    var metadata;

    if (data) {
      if (this.state['sort-labels']) {
        data.sort(this.state['sort-labels']);
      }

      if (that.state.filter) {
        var res = that.state.filter(data);
        if (typeof(res) === 'function') {
          data = data.filter(res)
        } else {
          res = Math.ceil(res) + 1;
          data = data.filter(function (el) {
            return (el.value || el.count) > res;
          });
        }
      }

      labels = data.map(function (el) {
        if (that.state.labelMap) return that.state.labelMap(el.label);
        return el.label;
      });
      values = data.map(function (el) {
        return parseInt(el.count);
      });
      metadata = data.map(function (el) {
        return el.metadata;
      });
    }

    return (
      <div className="ui center aligned segment">
        <div className="row">
          <ChartSegmentHeader click={saveAsImage(this)} title={this.state.title}/>
          <div className={className}>
            {(function (state) {
              if (!state.data) return (<div><p></p><p></p></div>)

              return (
                <HistogramChart onBarClick={state.onBarClick} barValueSpacing={state.barValueSpacing} fillColor={state.fillColor} highlightFill={state.highlightFill} labels={labels} values={values} scale={state.scale} />
              )
            })(this.state)}
          </div>
          {(function (state) {
            if (state.data) return (<a href="#" onClick={state.showAsTable(state.data)}>Show as table</a>)
          })(this.state)}
        </div>
      </div>
    )
  }
});

var PieSegment = React.createClass({
  getInitialState: function () {
    return {
      data: null,
      title: null,
      labelMap: null
    };
  },
  render: function () {
    var that = this;

    var className = 'ui segment basic';
    if (!this.state.data) className += ' loading';

    var data = this.state.data
    if (data) {
      data = this.state.data.map(function (el) {
        return {
          label: that.state.labelMap ? that.state.labelMap(el.label) : el.label,
          value: el.count,
          color: getRandomColor()
        };
      })
    };

    return (
      <div className="ui center aligned segment">
        <div className="row">
          <ChartSegmentHeader click={saveAsImage(this)} title={this.state.title}/>
          <div className={className}>
            {(function (state) {
              if (!state.data) return (<div><p></p><p></p></div>)

              return (<PieChart data={data}/>)
            })(this.state)}
          </div>
          {(function (state) {
            if (state.data) return (<a href="#" onClick={state.showAsTable(state.data)}>Show as table</a>)
          })(this.state)}
        </div>
      </div>
    )
  }
});

var ChartSegmentHeader = React.createClass({
  render: function () {
    var btnStyle = {
      float: 'right'
    };
    var iStyle = {
      marginRight: 0
    };
    return (
      <div className="ui header">
        <h3>
          {this.props.title}
          <button className="ui basic icon button" onClick={this.props.click} style={btnStyle}>
            <i className="save icon" style={iStyle}></i>
          </button>
        </h3>
      </div>
    )
  }
});

var GraphOverviewSegment = React.createClass({
  getInitialState: function () {
    return {
      overview: null
    }
  },
  render: function () {
    var className = 'ui segment basic';
    if (!this.state.overview) className += ' loading';

    var graphNames = [];
    for (var graph in this.state.overview) {
      if (this.state.overview[graph]) {
        graphNames.push(graph);
      }
    }

    return (
      <div className="ui center aligned segment">
        <h1>
          Graph overview
        </h1>
        <div className={className}>
          {(function (overview){
            if (!overview) return (<span className="text">Loading</span>)

            return (
              <table className="ui definition collapsing table">
                <thead>
                  <tr>
                    <th>Graph Name</th>
                    <th>Triples</th>
                    <th>Unique Classes</th>
                    <th>Unique Properties</th>
                    <th>Unique Subjects</th>
                  </tr>
                </thead>
                <tbody>
                  {graphNames.map(function (name) {
                    return (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>{overview[name].tripleCount}</td>
                        <td>{overview[name].distinctClassCount}</td>
                        <td>{overview[name].distinctPropertyCount}</td>
                        <td>{overview[name].distinctSubjectCount}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )
          })(this.state.overview)}
        </div>
      </div>
    )
  }
});

var OverviewSegment = React.createClass({
  getInitialState: function () {
    return {
      data: null,
      title: null
    }
  },
  render: function () {
    var that = this;

    var className = 'ui segment basic';
    if (!this.state.data) className += ' loading';

    return (
      <div className="ui center aligned segment">
        <div className="row">
          <h3>
            {this.state.title}
          </h3>
          <div className={className}>
            {(function (state) {
              if (!state.data) return (<div><p></p><p></p></div>)

              return (
                <table className="ui collapsing celled table">
                  <tbody>
                    {state.data.map(function (el) {
                      return (
                        <tr key={objectHash(el.label + el.value)}>
                          <td>{el.label}</td>
                          <td>{el.value || el.count}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )
            })(this.state)}
          </div>
        </div>
      </div>
    )
  }
});

// Table components
var StatsTable = React.createClass({
  render: function () {
    this.props.data.sort(function (a, b) {
      var va = parseInt(a.value || a.count);
      var vb = parseInt(b.value || b.count);

      return vb - va;
    });
    return (
      <div className="row">
        <div className="column">
          <table className="ui celled table">
            <thead>
              <tr>
                <th className="">Name</th>
                <th className="descending">Count</th>
              </tr>
            </thead>
            <tbody>
              {this.props.data.map(function (el) {
                return (
                  <tr key={objectHash(el.label + " " + el.value || el.count)}>
                    <td>{el.label}</td>
                    <td>{el.value || el.count}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
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

var EntitiesTable = React.createClass({
  render: function () {
    return (
      <table className="table stripped ui collapsing">
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

var getRandomColor = function () {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
