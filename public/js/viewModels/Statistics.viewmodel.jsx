'use strict';

(function (app) {
  var statistics = app.views.Statistics = {};

  statistics.show = function (view) {
    console.log(view);
    if (!statistics.ChartsContainer) {
      statistics.ChartsContainer = ReactDOM.render(
        <app.React.ChartsContainer charts={app.Charts}/>,
        $('#statistics-container').get(0)
      );
    }

    statistics.ChartsContainer.setView(view);
  };
})(window.app);
