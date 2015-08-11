'use strict';

module.exports = {
  GRAPH_OVERVIEW : 'select (str(?tCount) as ?tripleCount) (str(?sCount) as ?distinctSubjectCount) (str(?cCount) as ?distinctClassCount) (str(?pCount) as ?distinctPropertyCount) ?graphName where {{select (count(*) as ?tCount) (count(distinct ?s) as ?sCount) (count(distinct ?class) as ?cCount) (count(distinct ?p) as ?pCount) where {?s ?p ?o . optional {?s a ?class . } } } union {select (count(*) as ?tCount) (count(distinct ?s) as ?sCount) (count(distinct ?class) as ?cCount) (count(distinct ?p) as ?pCount) ?graphName where {graph ?graphName {?s ?p ?o . optional {?s a ?class . } } } group by ?graphName order by ?graphName } }',
  CLASSES_OVERVIEW : 'select (str(count(?class)) as ?count) ?class where {?x a ?class } group by ?class order by desc(count(?class))',
  PROPERTIES_OVERVIEW: 'select (str(count(?property)) as ?count) ?property where {?x ?property [] } group by ?property order by desc(count(?property))',
  TRIPLES_COUNT : 'SELECT (COUNT(*) AS ?no) { ?s ?p ?o  }',

  CONTRACT_DISTRIBUTION_YEAR: 'SELECT ?year (count(?contract) as ?count) WHERE {?contract a grz-owl:Contract . ?contract event:time ?temp . ?temp time:inXSDDateTime ?date . BIND (year(?date) AS ?year). } GROUP BY ?year',
  CONTRACT_DISTRIBUTION_REGISTER: 'SELECT ?reg (count(?contract) as ?count) WHERE {?reg a grz-owl:Register ; grz-owl:has_document ?contract . } GROUP BY ?reg ',
  FOLIA_DISTRIBUTION_YEAR: 'SELECT ?year (count(?folia) as ?count) WHERE {?contract a grz-owl:Contract . ?contract event:time ?temp . ?temp time:inXSDDateTime ?date . ?contract grz-owl:onPage ?folia . BIND (year(?date) AS ?year) . } GROUP BY ?year',
  FOLIA_DISTRIBUTION_REGISTER: 'SELECT ?reg (count(?folia) as ?count) WHERE {?reg a grz-owl:Register ; grz-owl:has_folia ?folia . } GROUP BY ?reg ',
};