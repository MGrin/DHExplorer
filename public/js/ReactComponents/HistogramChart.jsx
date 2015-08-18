(function (app) {
  app.React.HistogramChart = React.createClass({
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
          onShowAsTableClick: null,
          onSaveAsImageClick: app.React.helpers.saveAsImage
        }
      };
    },
    saveCurrentState: function () {
      if (!this.stateHistory) this.stateHistory = [];
      this.stateHistory.push($.extend(true, {}, this.state));
      return this;
    },
    setTitle: function (title) {
      if (!this.newState) this.newState = {};

      this.newState.title = title;
      return this;
    },
    setProperty: function (name, value) {
      if (!this.newState) this.newState = {};

      this.newState[name] = value;
      return this;
    },
    setData: function (data) {
      if (!this.newState) this.newState = {};

      this.newState.data = data;
      this.apply();
      return this;
    },
    setDataProcessors: function (processors) {
      if (!this.newState) this.newState = {};

      this.newState.dataProcessors = processors;
      return this;
    },
    setFilters: function (filters) {
      if (!this.newState) this.newState = {};

      this.newState.filters = filters;
      return this;
    },
    setFilter: function (name, fn) {
      if (!this.newState) this.newState = {};
      if (!this.newState.filters) this.newState.filters = {};

      this.newState.filters[name] = fn;
      return this;
    },
    setListeners: function (listeners) {
      if (!this.newState) this.newState = {};

      this.newState.listeners = listeners;
      return this;
    },
    setListener: function (event, fn) {
      if (!this.newState) this.newState = {};
      if (!this.newState.listeners) this.newState.listeners = this.state.listeners;

      this.newState.listeners[event] = fn;
      return this;
    },
    setChartConfig: function (config) {
      if (!this.newState) this.newState = {};

      this.newState.chartConfig = config;
      return this;
    },
    apply: function () {
      this.setState(this.newState);
      this.newState = {};
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
          return new app.React.helpers.HiddenLabel(el);
        });
      }
    },
    render: function () {
      var that = this;

      var className;
      var content;
      var footer;
      var title;

      var showGoBackBtn = (that.stateHistory && that.stateHistory.length > 0) ? true : false;

      var onShowAsTableClick;
      var onSaveAsImageClick;
      var onGoBackClick;

      if (!this.state.data) {
        className = 'ui segment basic loading';
        content = (<div><p></p><p></p></div>);
        footer = (<div></div>);
        title = '';
        onSaveAsImageClick = function () {};
        onGoBackClick = function () {};
      } else {
        className = 'ui segment basic';
        this.transformData();
        content = (<canvas />);
        onShowAsTableClick = this.state.listeners.onShowAsTableClick;
        footer = (<a href="#" onClick={onShowAsTableClick(this.state.data)}>Show as table</a>);
        title = this.state.title;
        onSaveAsImageClick = this.state.listeners.onSaveAsImageClick;
        onGoBackClick = function () {
          if (!that.stateHistory || that.stateHistory.length === 0) return;

          var historyState = that.stateHistory.pop();
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
    componentDidUpdate: function () {
      if (!this.state.chartData) return;

      if (this.chart) {
        this.chart.destroy();
      }
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
})(window.app);
