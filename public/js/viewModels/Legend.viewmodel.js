'use strict';

(function (app) {
  var legend = app.views.Legend = {};
  legend.listeners = {};

  legend.init = function () {
    return legend;
  };

  legend.registerListener = function (event, listener) {
    legend.listeners[event] = listener;
  };

  legend.appendType = function (type) {
    $('.top-menu #legend').append(legend.typeHTML(type));

    $('#type-' + type.id).click(function () {
      legend.listeners['legend-click'](type);

      $(this).toggleClass('type-visible');
      if ($(this).hasClass('type-visible')) {
        $(this).find('.icon').each(function () {
          $(this).css('color', type.color);
        });
      } else {
        $(this).find('.icon').each(function () {
          $(this).css('color', '#EEEEEE');
        });
      }
    });
  };

  legend.typeHTML = function (type) {
    return '<div class="item type-visible" id="type-' + type.id + '">' +
              '<i class="icon circle Thin" style="color: ' + type.color + '"></i>' +
              '<span class="text">' + type.label + '</span>' +
            '</div>';
  };
})(window.app);
