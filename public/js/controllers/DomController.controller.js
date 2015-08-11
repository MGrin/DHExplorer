'use strict';

(function (app) {
  var dom = app.dom = {};
  console.log('Dom controller loaded');

  dom.onDomReady = function () {
    console.log('Dom controller onDomReady callback called');
    
    // $('#bottom-menu').hide();
    // $('#initial-modal').modal('show');

    $('.explorer-view-content').each(function () {
      $(this).height($('body').height() - 2*$('#bottom-menu').height() + 2);
    });

    $('.explorer-view').not('[data-view="graph"]').transition('scale');
    // $('#statistics-container').css('margin-top', 14);
    // $('.explorer-view').transition('scale');

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

    $('#query-input').val(app.QueryController.query);

    $('[stats-click]').each(function () {
      $(this).click(app.StatisticsController.sectionClick($(this), $(this).attr('stats-click')));
    });

    app.dom.status = $('#status-text');
    app.dom.loader = $('#status-loader');

    app.dom.graph = $('#graph-container');
    app.dom.entity = $('#entity-container .row .column');

    app.dom.legendMenu = $('.top-menu #legend');
    app.dom.entityModal = $('#entity-modal');

    dom.onSidebarClick('graph')('onPageLoad');
    app.QueryController.notify();
  };

  dom.onSidebarClick = function (view) {
    var onSwitchDone = function () {
      $('#sidebar').sidebar('hide');
    };

    return function (firstTime) {
      if (app.dom.view === view) return;

      if (firstTime !== 'onPageLoad') {
        $('.explorer-view[data-view="' + dom.view + '"]').transition('scale');
        $('.explorer-view[data-view="' + view + '"]').transition('scale');
      }
      app.dom.view = view;
      $('#sidebar .item').not('[data-toggle-view="' + view + '"]').removeClass('active').addClass('link');
      $(this).addClass('active');
      $(this).removeClass('link');


      switch (view) {
        case 'entity': {
          $('#bottom-menu #query').removeClass('hide');
          $('#bottom-menu .statistics-selection').addClass('hide');

          app.EntityController.open(onSwitchDone);
          break;
        }
        case 'graph': {
          $('#bottom-menu #query').removeClass('hide');
          $('#bottom-menu .statistics-selection').addClass('hide');

          app.GraphController.open(onSwitchDone);
          break;
        }
        case 'statistics': {
          $('#bottom-menu #query').addClass('hide');
          $('#bottom-menu .statistics-selection').removeClass('hide');

          app.StatisticsController.open(onSwitchDone);
          break;
        }
      }
    };
  };

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
    $('#entity-modal').modal('hide');
    $('#loader-dimmer .text').text(text);
    $('#loader-dimmer').addClass('active');
  };

  dom.hideDimmer = function () {
    $('#loader-dimmer').removeClass('active');
  };

  dom.showEntityModal = function (entity) {
    $('#entity-modal').modal('hide');
    app.views.Entity.setModalEntity(entity);
    dom.hideDimmer();
    $('#entity-modal').modal('show');
  };
})(window.app);

window.app.addOnDocumentReady('DomController', window.app.dom.onDomReady, []);