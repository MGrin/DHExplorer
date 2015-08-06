'use strict';

(function (app) {
  console.log('Storage service loaded');
  
  var storage = app.Storage = function (name) {
    this.name = name;
    this.map = d3.map();

    storage[name] = this;
  };

  storage.getStorage = function (name) {
    return storage[name];
  };

  storage.prototype.get = function (id) {
    return this.map.get(id);
  };

  storage.prototype.set = function (id, item) {
    this.map.set(id, item);
  };

  storage.prototype.has = function (id) {
    return this.map.has(id);
  };

  storage.prototype.size = function () {
    return this.map.size();
  };

  storage.prototype.remove = function (id) {
    return this.map.remove(id);
  };

  storage.prototype.destroy = function () {
    delete this.map;
    delete storage[this.name];
  };

  storage.prototype.getArray = function (length, offset, predicate) {
    var arr = [];

    var counter = -1;

    for (var id in this.map._) {
      if (this.map.has(id)) {
        counter++;
        if (offset && counter < offset) continue;

        if (predicate && !predicate(this.map.get(id))) {
          if (counter > -1) counter--;
          continue;
        }

        arr.push(this.map.get(id));
        if (length && counter > offset + length - 2) break;
      }
    }

    return arr;
  };

  storage.Graph = new storage('Graph');
  storage.NodeType = new storage('NodeType');
})(window.app);