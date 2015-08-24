'use strict';

(function (app) {
  var model = app.DataModel = {};

  model.Person = function (entity) {
    var directPredicates = {};

    for (var predicateId in entity.objects) {
      if (entity.objects[predicateId]) {
        var label = app.React.helpers.transformRDFLabel('#')(entity.predicates[predicateId].value);

        if (!directPredicates[label]) directPredicates[label] = {
          label: label,
          content: []
        };

        var en = app.Storage.Entity.get(entity.objects[predicateId]);
        if (!en) continue;

        directPredicates[label].content.push(en);
      }
    }

    console.log(directPredicates);

    this.name = directPredicates.label.content[0].tuple.value;
    this.gender = directPredicates.gender.content[0].tuple.value;

    // var reversedPredicates = {};
    // for (var predicateId in entity.origins) {
    //   if (entity.origins[predicateId]) {
    //     var label = app.React.helpers.transformRDFLabel('#')(entity.predicates[predicateId].value);
    //     if (!reversedPredicates[label]) reversedPredicates[label] = {
    //       label: label,
    //       content: []
    //     }

    //     var en = app.Storage.Entity.get(entity.origins[predicateId]);
    //     if (!en) continue;

    //     reversedPredicates[label].content.push(en);
    //   }
    // }
  };

  model.Connection = {
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
  };
})(window.app);
