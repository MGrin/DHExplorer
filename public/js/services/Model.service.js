'use strict';

(function (app) {
  var model = app.DataModel = {};

  model.Person = {
    Connection: {
      isKnows: function (c) {
        return c === 'http://xmlns.com/foaf/0.1/knows';
      },
      isApprentice: function (c) {
        return c === 'http://128.178.21.39:8080/garzoni/ontology#apprentice_of';
      },
      isColleague: function (c) {
        return c === 'http://128.178.21.39:8080/garzoni/ontology#colleague_of';
      },
      isGuarantor: function (c) {
        return c === 'http://128.178.21.39:8080/garzoni/ontology#guarantor_of';
      },
      isMaster: function (c) {
        return c === 'http://128.178.21.39:8080/garzoni/ontology#has_apprentice';
      }
    }
  };
})(window.app);
