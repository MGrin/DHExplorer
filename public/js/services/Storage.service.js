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
