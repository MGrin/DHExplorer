'use strict';

(function (app) {
  var Type = app.models.NodeType = function (rdfType) {
    this.rdfType = rdfType;
    this.label = Type.generateLabel(rdfType);
    this.id = Type.generateId(rdfType);
    this.color = (!this.rdfType) ? '#CCCCCC' : getRandomColor();
    this.isVisible = true;
  };

  Type.prototype.getIconClass = function () {
    switch (this.label) {
      case 'no-type': {
        return 'help icon';
      }
    }
  };

  Type.types = new app.Storage('NodeType');

  Type.update = function (t) {
    var typeId;
    if (app.Storage.NodeType.has(t)) {
      typeId = t;
    } else if (app.Storage.NodeType.has(app.models.NodeType.generateId(t))) {
      typeId = app.models.NodeType.generateId(t);
    } else {
      var type = new Type(t);
      app.Storage.NodeType.set(type.id, type);
      app.LegendController.addNewType(type);
      typeId = type.id;
    }

    return typeId;
  };

  Type.generateId = function (type) {
    if (!type || type === 'no-type') return 'no-type';

    if (type.id) return type.id;
    if (Type.types.has(type)) return type;

    return objectHash(Type.generateLabel(type)); // TODO change to hash
  };

  Type.generateLabel = function (type) {
    if (!type) return 'Not typed';

    if (type.id) return type.label;

    var typeSplit = type.split('#');
    return typeSplit[typeSplit.length - 1];
  };
})(window.app);
