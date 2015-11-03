/**
 * WebGL models
 *
 * Created by Nikita Grishin on 08.2015
 */

'use strict';

(function (app) {
  var models = app.WebGL.models = {};

  var maleColor = 0x009ee8;
  var femaleColor = 0xE800E8;

  var maleActiveColor = 0x7e73e8;
  var femaleActiveColor = 0xea2d74;

  // Define a Circle model for the graph node
  models.Circle = function (node) {
    this.node = node;
    this.gender = node.data.data.gender;

    this.color = (this.gender === 'M') ? maleColor : femaleColor;
    this.activeColor = (this.gender === 'M') ? maleActiveColor : femaleActiveColor;

    this.size = 12;
    this.activeSize = 22;
  };

  models.Circle.prototype.getColor = function () {
    return (app.views.Graph.lastClickedNode === this.node) ? this.activeColor : this.color;
  };

  models.Circle.prototype.getSize = function () {
    return (app.views.Graph.lastClickedNode === this.node) ? this.activeSize : this.size;
  };
})(window.app);
