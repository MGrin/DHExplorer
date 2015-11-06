/**
 * React Component used to draw charts - Pie and Bar
 *
 * Created by Nikita Grishin on 08.2015
 */

'use strict';

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

  app.React.Chart = React.createClass({
    getInitialState: function () {
      return {
        chart: this.props.chart,
        iteration: 0
      };
    },
    saveCurrentState: function () {
      if (!this.stateHistory) this.stateHistory = [];
      this.stateHistory.push($.extend(true, {}, this.state));
    },
    setChart: function (chart) {
      this.state.chart.destroyPlot();
      this.saveCurrentState();
      this.setState({chart: chart})
    },
    downsampleLabels: function (scale, labels) {
      var length = labels.length;
      var scale = scale;

      if (length > scale) {
        var downsampleRate = Math.ceil(length / scale);

        return labels.map(function (el, index) {
          if (index % downsampleRate === 0) return el;
          return new app.React.helpers.HiddenLabel(el);
        });
      }
    },
    componentWillMount: function () {
      this.isMounted = true;

      var that = this;
      if (!this.state.chart.isLoaded()) {
        that.state.chart.executeQuery(function () {
          if (that.isMounted) that.setState({iteration: that.state.iteration + 1});
        });
      } else {
        that.setState({iteration: that.state.iteration + 1});
      }
    },
    render: function () {
      var that = this;

      var className;
      var content;
      var footer;
      var title = this.state.chart.title;

      var showGoBackBtn = (this.stateHistory && this.stateHistory.length > 0) ? true : false;

      var onShowAsTableClick = this.state.chart.listeners['onShowAsTableClick'];
      var onSaveAsImageClick = this.state.chart.listeners['onSaveAsImageClick'];

      var onGoBackClick;

      if (!this.state.chart.isLoaded()) {
        className = 'ui segment basic loading';
        content = (<div><p></p><p></p></div>);
        footer = (<div></div>);
        onSaveAsImageClick = function () {};
        onGoBackClick = function () {};
      } else {
        className = 'ui segment basic';
        content = (<canvas />);
        footer = (<a href="#" onClick={onShowAsTableClick(this.state.chart.data)}>Show as table</a>);

        onGoBackClick = function () {
          if (!that.stateHistory || that.stateHistory.length === 0) return;

          var historyState = that.stateHistory.pop();
          that.state.chart.destroyPlot();
          that.setState(historyState);
        };
      }

      return (
        <div className="ui center aligned segment">
          <div className="row">
            <app.React.ChartHeader saveImage={onSaveAsImageClick(this)} showGoBackBtn={showGoBackBtn} goBack={onGoBackClick} title={title}/>
            <div className={className}>
              {content}
            </div>
            {footer}
          </div>
        </div>
      )
    },
    plotChart: function () {
      if (!this.state.chart.isLoaded()) return;

      if (this.state.chart.hasPlot()) {
        this.state.chart.destroyPlot();
      }
      var that = this;

      var labels = that.state.chart.labels;
      var values = that.state.chart.values;
      var metadata = that.state.chart.metadata;
      var options = this.state.chart.options;

      var data;

      if (this.state.chart.type === 'bar') {
        if (options.scale) labels = that.downsampleLabels(options.scale, labels);

        var fillColor = options.fillColor || 'rgba(151,187,205,0.5)';
        var highlightFill = options.highlightFill || 'rgba(151,187,205,0.75)';
        var barStrokeWidth = options.barStrokeWidth || 0;
        var barValueSpacing = options.barValueSpacing || 1;

        data = {
          labels: labels,
          datasets: [{
            fillColor: fillColor,
            highlightFill: highlightFill,
            data: values
          }]
        };

        var maxValue = -1;

        values.map(function (el) {
          if (el > maxValue) maxValue = el;
        });

        var chartConfig = {
          animation : false,
          barStrokeWidth : barStrokeWidth,
          barValueSpacing : barValueSpacing,
          scaleOverride : true,
          scaleSteps : 10,
          scaleStepWidth : Math.ceil(maxValue / 10), // TODO round to make the steps beautiful
          scaleStartValue : 0
        };

        that.state.chart.setPlot(new Chart($(ReactDOM.findDOMNode(that)).find('canvas').get(0).getContext('2d')).Bar(data, chartConfig));

        if (that.state.chart.listeners.onBarClick) {
          that.state.chart.getPlot().chart.canvas.onclick = function (e) {
            var activePoints = that.state.chart.getPlot().getBarsAtEvent(e);
            if (!activePoints || activePoints.length === 0) return;
            var label = activePoints[0].label;
            that.state.chart.listeners.onBarClick(label, that);
          };
        }
      } else if (this.state.chart.type === 'pie') {
        data = [];
        for (var i = 0; i < labels.length; i++) {
          data.push({
            label: labels[i],
            value: values[i],
            color: getRandomColor()
          });
        }

        var chartConfig = {
          animation : false
        }
        that.state.chart.setPlot(new Chart($(ReactDOM.findDOMNode(that)).find('canvas').get(0).getContext('2d')).Doughnut(data, chartConfig));
        $(window).trigger('resize');
      }
    },
    componentDidMount: function () {
      this.plotChart();
    },
    componentDidUpdate: function () {
      this.plotChart();
    },
    componentWillUnmount: function () {
      this.isMounted = false;
    }
  });
})(window.app);
