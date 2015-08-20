'use strict';

(function (app) {
  var models = app.WebGL.models = {};

  var maleColor = 0x009ee8;
  var femaleColor = 0xE800E8;

  models.Circle = function (node) {
    this.size = 12;
    this.color = maleColor;
  };

})(window.app);
