'use strict';

(function (app) {
  var model = app.DataModel = {};
  model.constants = {};

  var familyRelations = model.constants.familyRelations = [
    'son_of',
    'father_of',
    'brother_of',
    'grandson_of',
    'mother_of',
    'uncle_of',
    'widow_of',
    'daughter_of',
    'family_of',
    'aunt_of',
    'cousin_of',
    'stepfather_of',
    'brother-in-law_of',
    'wife_of',
    'grandfather_of',
    'heir_of',
    'granddaughter_of',
    'nephew_of',
    'grandmother_of',
    'sister_of',
    'godfather_of',
    'stepmother_of',
    'father-in-law_of',
    'husband_of',
    'sister-in-law_of',
    'great-grandchild_of',
    'adopted_son_of',
    'mother-in-law_of',
    'godmother_of',
    'great-grandfather_of',
    'son-in-law_of',
    'stepson_of',
    'adopter_of',
    'partner_of',
    'has_business_with',
    'referenceGeneric',
    'colleague_of'
  ];

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

    // console.log(directPredicates);

    this.name = directPredicates.label.content[0].tuple.value;
    this.gender = directPredicates.gender ? directPredicates.gender.content[0].tuple.value : 'x';
    this.mentions = directPredicates.has_mention.content;

    this.family = {};
    for (var i = 0; i < familyRelations.length; i++) {
      if (directPredicates[familyRelations[i]]) {
        this.family[familyRelations[i]] = directPredicates[familyRelations[i]].content;
      }
    }

    this.situations = directPredicates.hasTimeIndexedSetting.content;
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
