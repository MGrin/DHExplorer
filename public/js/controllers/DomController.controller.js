/**
 * Dom controller
 * A controller that handles all (if possible) dom manipulations.
 * TODO Change the application design in order to completely remove this controller.
 * Its existance is a big hack on Semantic-ui framework
 *
 * Created by Nikita Grishin on 08.2015
 */

'use strict';

(function (app) {
  var dom = app.dom = {};

  var firstView = 'graph'; // The application starting view

  dom.onDomReady = function () {
    $('#graph-container').height($('body').height() - 80);

    $('.explorer-view').not('[data-view="' + firstView + '"]').transition('scale'); // making other views invisible
    $('.top-menu .dropdown').dropdown({
      action: 'nothing'
    });

    $('#sidebar-toggle').click(function () {
      $('#sidebar').sidebar('toggle');
    });

    $('#sidebar .item').each(function () {
      var view = $(this).attr('data-toggle-view');
      $(this).click(dom.onSidebarClick(view));
    });

    $('[stats-click]').each(function () {
      $(this).click(app.StatisticsController.sectionClick($(this), $(this).attr('stats-click')));
    });

    $('#entity-container .menu .item').tab();

    app.dom.status = $('#status-text');
    app.dom.loader = $('#status-loader');

    $('#sidebar .item[data-toggle-view="' + firstView + '"]').trigger('click');
  };

  // Handles the sidebar buttons click, view is the name of the clicked view (entity, graph, statistics)
  dom.onSidebarClick = function (view) {
    var onSwitchDone = function () {
      $('#sidebar').sidebar('hide');
    };

    return function () {
      if (dom.view === view) return;

      if (dom.view) {
        $('.explorer-view[data-view="' + dom.view + '"]').transition('scale');
        $('.explorer-view[data-view="' + view + '"]').transition('scale');

        if (dom.view === 'graph') app.GraphController.close();
      }
      app.dom.view = view;
      $('#sidebar .item').not('[data-toggle-view="' + view + '"]').removeClass('active').addClass('link');
      $(this).addClass('active');
      $(this).removeClass('link');


      switch (view) {
        case 'entity': {
          $('.bottom-menu .statistics-selection').addClass('hide');
          $('.settings-visibility-toggle').addClass('hide');

          app.EntityController.open(onSwitchDone);
          break;
        }
        case 'graph': {
          $('.bottom-menu .statistics-selection').addClass('hide');
          $('.settings-visibility-toggle').removeClass('hide');

          app.GraphController.open(onSwitchDone);
          break;
        }
        case 'statistics': {
          $('.bottom-menu .statistics-selection').removeClass('hide');
          $('.settings-visibility-toggle').addClass('hide');

          app.StatisticsController.open(onSwitchDone);
          break;
        }
      }
    };
  };

  // Function that handles the error display.
  // IT SHOULD BE USED EVERYTIME YOU WANT TO SHOW AN ERROR!!!
  dom.showError = function (err) {
    if (err.length < 20) dom.status.html('<span class="ui red horizontal label"><i class="icon warning sign"></i>' + err + '</span>');
    else {
      dom.status.html('<span id="error-span" class="ui red horizontal label link" data-content="' + err + '"><i class="icon warning sign"></i>Error. Click for details</span>');
      $('#error-span').popup({
        on: 'click'
      });
    }
  };

  dom.hideError = function () {
    dom.status.html('');
  };

  dom.setStatusText = function (text) {
    dom.status.text(text);
  };

  dom.startStatusLoader = function () {
    dom.loader.addClass('active');
  };

  dom.stopStatusLoader = function () {
    dom.loader.removeClass('active');
  };

  dom.showDimmer = function (text) {
    $('#entity-modal-container .modal').modal('hide');
    $('#loader-dimmer .text').text(text);
    $('#loader-dimmer').addClass('active');
  };

  dom.hideDimmer = function () {
    $('#loader-dimmer').removeClass('active');
  };
})(window.app);

window.app.addOnDocumentReady('DomController', window.app.dom.onDomReady, []);
