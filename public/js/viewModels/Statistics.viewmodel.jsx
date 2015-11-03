/**
 * Statistics viewmodel
 * Handling all processes needed to visualise elements related to Statistics
 *
 * Created by Nikita Grishin on 08.2015
 */

'use strict';

(function (app) {
  var statistics = app.views.Statistics = {};

  statistics.show = function (view) {
    if (!statistics.ChartsContainer) {
      // Rendering the charts container
      statistics.ChartsContainer = ReactDOM.render(
        <app.React.ChartsContainer charts={app.Charts}/>,
        $('#statistics-container').get(0)
      );
    }

    statistics.ChartsContainer.setView(view);
  };
})(window.app);
