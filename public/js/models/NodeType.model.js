/**
* A Node Type model.
*
* Created by Nikita Grishin on 08.2015
*/

'use strict';

(function (app) {
  /**
   * @param {string} a node type as it is described in rdf
   */
  var Type = app.models.NodeType = function (rdfType) {
    this.rdfType = rdfType;
    this.label = Type.generateLabel(rdfType);
    this.id = Type.generateId(rdfType);
    this.color = (!this.rdfType) ? '#CCCCCC' : getRandomColor();
    this.isVisible = true;
  };

  // TODO for graph...
  Type.prototype.getIconClass = function () {
    switch (this.label) {
      case 'no-type': {
        return 'help icon';
      }
    }
  };

  Type.prototype.isEqual = function (t) {
    return t === this.label || t === this.rdfType;
  };

  Type.types = new app.Storage('NodeType');

  /**
   * @param  {NodeType} type to update (or create) in the NodeTypes storage
   * @return {string} the id of the type
   */
  Type.update = function (t) {
    var typeId;
    if (app.Storage.NodeType.has(t)) {
      typeId = t;
    } else if (app.Storage.NodeType.has(app.models.NodeType.generateId(t))) {
      typeId = app.models.NodeType.generateId(t);
    } else {
      var type = new Type(t);
      app.Storage.NodeType.set(type.id, type);
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
