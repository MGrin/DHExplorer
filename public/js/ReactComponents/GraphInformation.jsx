(function (app) {
  app.React.GraphInformation = React.createClass({
    getInitialState: function () {
      return {
        nodesCount: 0,
        maleCount: 0,
        femaleCount: 0,

        edgesCount: 0
      }
    },
    render: function () {
      return (
        <div className="ui accordion">
          <div className="active title">
            <i className="dropdown icon"></i>
            Statistics
          </div>
          <div className="active content">
            <div className="ui mg-animated centered grid">
              <div className="mg-visible ui small statistic transition visible">
                <div className="value">{this.state.nodesCount}</div>
                <div className="label">Persons</div>
              </div>
              <div className="mg-hidden ui small statistics transition hidden">
                <div className="ui small statistic">
                  <div className="value">{this.state.maleCount}</div>
                  <div className="label">Men</div>
                </div>
                <div className="ui small statistic">
                  <div className="value">{this.state.femaleCount}</div>
                  <div className="label">Women</div>
                </div>
              </div>
            </div>

            <div className="ui mg-animated centered grid">
              <div className="mg-visible ui small statistic transition visible">
                <div className="value">{this.state.edgesCount}</div>
                <div className="label">Connections</div>
              </div>
              <div className="mg-hidden ui small statistics transition hidden">
                <div className="ui small statistic">
                  <div className="value">{this.state.edgesCount}</div>
                  <div className="label">Knows</div>
                </div>
              </div>
            </div>
          </div>
          <div className="title">
            <i className="dropdown icon"></i>
            Network
          </div>
          <div className="content">
            Test
          </div>
        </div>
      )
    },
    componentDidMount: function () {
      var domNode = React.findDOMNode(this);
      $(domNode).accordion({});

      $(domNode).find('.mg-animated').each(function () {
        var animatedWrapper = this;

        $(animatedWrapper).mouseenter(function () {
          $(animatedWrapper).find('.mg-visible').transition({
            animation: 'scale',
            duration: 250,
            onComplete: function () {
              $(animatedWrapper).find('.mg-hidden').transition('scale');
            }
          });
        });

        $(animatedWrapper).mouseleave(function () {
          $(animatedWrapper).find('.mg-hidden').transition({
            animation: 'scale',
            duration: 250,
            onComplete: function () {
              $(animatedWrapper).find('.mg-visible').transition('scale');
            }
          });
        });
      });
    }
  });
})(window.app);
