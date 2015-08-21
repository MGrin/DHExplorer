(function (app) {
  app.React.PieChart = React.createClass({
    setData: function (data) {
      this.setState({
        data: data
      });
    },
    getInitialState: function () {
      return {
        listeners: {
          onSaveAsImageClick: app.React.helpers.saveAsImage
        }
      };
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

      var onShowAsTableClick;
      var onSaveAsImageClick;

      if (!this.state.data) {
        className = 'ui segment basic loading';
        content = (<div><p></p><p></p></div>);
        footer = (<div></div>);
        title = '';
        onSaveAsImageClick = function () {};
      } else {
        className = 'ui segment basic';
        this.transformData();
        content = (<canvas />);
        onShowAsTableClick = this.state.listeners.onShowAsTableClick;
        footer = (<a href="#" onClick={onShowAsTableClick(this.state.data)}>Show as table</a>);
        title = this.state.title;
        onSaveAsImageClick = this.state.listeners.onSaveAsImageClick;
      }

      return (
        <div className="ui center aligned segment">
          <div className="row">
            <app.React.ChartHeader click={onSaveAsImageClick(this)} title={title}/>
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
      $(window).trigger('resize');
    }
  });
})(window.app);
