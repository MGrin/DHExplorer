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

var HiddenLabel = function (label) {
  this.value = label;
};

HiddenLabel.prototype.toString = function () {
  return '';
};


var HistogramSegment = React.createClass({
  getInitialState: function () {
    return {
      data: null,
      dataProcessors: {
        'data-sort': null,
        'data-filter': null
      },
      filters: {
        'label-transform': null,
        'value-transform': null
      },
      chartConfig: null,
      listeners: {
        onBarClick: null,
        onShowAsTableClick: null
      }
    };
  },
  setTitle: function (title) {
    this.setState({
      title: title
    });
    return this;
  },
  setData: function (data) {
    this.setState({
      data: data
    });
    return this;
  },
  setDataProcessors: function (processors) {
    this.setState({
      dataProcessors: processors
    });
    return this;
  },
  setFilters: function (filters) {
    this.setState({
      filters: filters
    });
    return this;
  },
  setListeners: function (listeners) {
    this.setState({
      listeners: listeners
    });
    return this;
  },
  setChartConfig: function (config) {
    this.setState({
      chartConfig: config
    });
    return this;
  },
  transformData: function () {
    var data = this.state.data;
    if (this.state.dataProcessors) {
      var labelSort = this.state.dataProcessors['data-sort'];
      var dataFilter = this.state.dataProcessors['data-filter'];

      if (labelSort) {
        data.sort(labelSort);
      }

      if (dataFilter) {
        var filter = dataFilter(data);
        if (typeof(filter) === 'function') {
          data = data.filter(filter);
        } else {
          data = data.filter(function (el) {
            return el.value > filter;
          });
        }
      }
    }

    var labelTransform;
    var valueTransform;

    if (this.state.filters) {
      labelTransform = this.state.filters['label-transform'];
      valueTransform = this.state.filters['value-transform'];
    }

    this.state.chartData = {};
    this.state.chartData.labels = data.map(function (el) {
      if (labelTransform) return labelTransform(el.label);
      return el.label;
    });

    this.state.chartData.values = data.map(function (el) {
      if (valueTransform) return valueTransform(el.count);
      return parseInt(el.count);
    });
    this.state.chartData.metadata = data.map(function (el) {
      return el.metadata;
    });
  },
  downsampleLabels: function () {
    var length = this.state.chartData.labels.length;
    var scale = this.state.chartConfig.scale;

    if (length > scale) {
      var downsampleRate = Math.ceil(length / scale);

      this.state.chartData.labels = this.state.chartData.labels.map(function (el, index) {
        if (index % downsampleRate === 0) return el;
        return new HiddenLabel(el);
      });
    }
  },
  render: function () {
    var className;
    var content;
    var footer;
    var title;

    if (!this.state.data) {
      className = 'ui segment basic loading';
      content = (<div><p></p><p></p></div>);
      footer = (<div></div>);
      title = '';
    } else {
      className = 'ui segment basic';
      this.transformData();
      content = (<canvas />);
      footer = (<a href="#" onClick={this.state.listeners.onShowAsTableClick(this.state.data)}>Show as table</a>);
      // footer = (<div></div>);
      title = this.state.title;
    }

    return (
      <div className="ui center aligned segment">
        <div className="row">
          <ChartSegmentHeader click={saveAsImage(this)} title={title}/>
          <div className={className}>
            {content}
          </div>
          {footer}
        </div>
      </div>
    )
  },
  componentWillUpdate: function () {
    if (this.chart) this.chart.destroy();
  },
  componentDidUpdate: function () {
    if (!this.state.chartData) return;

    var that = this;

    var chartConfig = that.state.chartConfig || {};

    if (chartConfig.scale) that.downsampleLabels();

    var labels = that.state.chartData.labels;
    var values = that.state.chartData.values;
    var metadata = that.state.chartData.metadata;

    var fillColor = chartConfig.fillColor || 'rgba(151,187,205,0.5)';
    var highlightFill = chartConfig.highlightFill || 'rgba(151,187,205,0.75)';
    var barStrokeWidth = chartConfig.barStrokeWidth || 0;
    var barValueSpacing = chartConfig.barValueSpacing || 1;

    var data = {
      labels: labels,
      datasets: [{
        fillColor: fillColor,
        highlightFill: highlightFill,
        data: values
      }]
    };

    var maxValue = -1;

    that.state.chartData.values.map(function (el) {
      if (el > maxValue) maxValue = el;
    });

    var chartConfig = {
      barStrokeWidth : barStrokeWidth,
      barValueSpacing : barValueSpacing,
      scaleOverride : true,
      scaleSteps : 10,
      scaleStepWidth : Math.ceil(maxValue / 10),
      scaleStartValue : 0
    };

    setTimeout(function () {
      that.chart = new Chart($(React.findDOMNode(that)).find('canvas').get(0).getContext('2d')).Bar(data, chartConfig);
      if (that.state.listeners.onBarClick) {
        that.chart.chart.canvas.onclick = function (e) {
          var activePoints = that.chart.getBarsAtEvent(e);
          that.state.listeners.onBarClick(activePoints, that.state.chartData.metadata);
        };
      }
    }, that.chart ? 0 : 1000);
  }
});

var PieSegment = React.createClass({
  setData: function (data) {
    this.setState({
      data: data
    });
  },
  getInitialState: function () {
    return {};
  },
  transformData: function () {
    var labelTransform = this.state['label-transform'];

    var data = this.state.data.map(function (el) {
      return {
        label: labelTransform ? labelTransform(el.label) : el.label,
        value: parseInt(el.count),
        color: getRandomColor()
      };
    });

    return data;
  },
  render: function () {
    var className;
    var content;
    var footer;
    var title;

    if (!this.state.data) {
      className = 'ui segment basic loading';
      content = (<div><p></p><p></p></div>);
      footer = (<div></div>);
      title = '';
    } else {
      className = 'ui segment basic';
      this.transformData();
      content = (<canvas />);
      footer = (<a href="#" onClick={this.state.listeners.onShowAsTableClick(this.state.data)}>Show as table</a>);
      title = this.state.title;
    }

    var data = this.state.data;

    return (
      <div className="ui center aligned segment">
        <div className="row">
          <ChartSegmentHeader click={saveAsImage(this)} title={this.state.title}/>
          <div className={className}>
            {content}
          </div>
          {footer}
        </div>
      </div>
    )
  },
  componentDidUpdate: function () {
    var that = this;
    if (!this.state.data) return;
    var data = this.transformData();
    that.chart = new Chart($(React.findDOMNode(that)).find('canvas').get(0).getContext('2d')).Doughnut(data);

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
  setData: function (data) {
    this.setState({overview: data});
  },

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
  setData: function (data) {
    this.setState({
      data: data
    });
  },
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
