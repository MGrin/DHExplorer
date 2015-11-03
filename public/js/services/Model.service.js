/**
 * TODO
 * Refactor this service.
 * It was supposed to reflect the schema of the RDF database to configure the visualisation of different entities
 * Now only Person Schema is reflected (for the graph purposes), and probably is already wrong or incomplete
 */

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

    this.name = directPredicates.label.content[0].tuple.value;
    delete directPredicates.label;
    this.gender = directPredicates.gender ? directPredicates.gender.content[0].tuple.value : 'x';
    delete directPredicates.gender;
    this.mentions = directPredicates.has_mention.content;
    delete directPredicates.has_mention;

    for (var key in directPredicates) {
      if (directPredicates[key]) {
        this[key] = directPredicates[key].content;
      }
    }
  };
})(window.app);
