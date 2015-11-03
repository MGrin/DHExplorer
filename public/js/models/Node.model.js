/**
* A Node model.
* A Node has an id, entity and data fields.
* Difference between entity and data - data is a row object from database, entity is an {Entity} object
*
* Created by Nikita Grishin on 08.2015
*/

'use strict';

(function (app) {
  var Node = function (id, entity, data) {
    this.id = id;
    this.entity = entity;
    this.data = data;
  };

  if (app) {
    app.models.Node = Node;
  } else {
    module.exports = Node;
  }
})((typeof(window) !== 'undefined') ? window.app : null);
