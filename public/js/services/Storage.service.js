/**
* A Storage service.
* Used to export the storing logic from the application
* Can be then changed to use the browser LocalStorage or whatever
* TODO: Verify if this storage is used everywhere where the storage is needed (I'm sure that not. Ex: Chart service)
*
* Created by Nikita Grishin on 08.2015
*/

'use strict';

(function (app) {
  var storage = app.Storage = function (name) {
    this.name = name;
    this.map = {};
    this.size = 0;

    storage[name] = this;
  };

  storage.getStorage = function (name) {
    return storage[name];
  };

  storage.prototype.get = function (id) {
    return this.map[id];
  };

  storage.prototype.set = function (id, item) {
    this.map[id] = item;
    this.size++;
  };

  storage.prototype.has = function (id) {
    return (this.map[id]) ? true : false;
  };

  storage.prototype.size = function () {
    return this.size;
  };

  storage.prototype.remove = function (id) {
    delete this.map[id];
    this.size--;
  };

  storage.prototype.destroy = function () {
    delete this.map;
    delete storage[this.name];
  };

  /**
   * Returns the storage's content as an array
   * @param  {number} length - the maximum size of the returned array
   * @param  {number} offset - the offset to be applied to the storage's content
   * @param  {Function} predicate - a predicate function that should be verified for a storage element to accept this element in the resulting array
   * @return {Array} Storage's content as an array
   */
  storage.prototype.getArray = function (length, offset, predicate) {
    var arr = [];

    var counter = -1;

    for (var id in this.map) {
      if (this.has(id)) {
        counter++;
        if (offset && counter < offset) continue;

        if (predicate && !predicate(this.get(id))) {
          if (counter > -1) counter--;
          continue;
        }

        arr.push(this.get(id));
        if (length && counter > offset + length - 2) break;
      }
    }

    return arr;
  };

  storage.Graph = new storage('Graph');
  storage.NodeType = new storage('NodeType');
})(window.app);
