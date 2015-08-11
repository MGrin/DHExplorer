'use strict';

module.exports = {
  GRAPH_OVERVIEW : 'select (str(?tCount) as ?tripleCount) (str(?sCount) as ?distinctSubjectCount) (str(?cCount) as ?distinctClassCount) (str(?pCount) as ?distinctPropertyCount) ?graphName where {{select (count(*) as ?tCount) (count(distinct ?s) as ?sCount) (count(distinct ?class) as ?cCount) (count(distinct ?p) as ?pCount) where {?s ?p ?o . optional {?s a ?class . } } } union {select (count(*) as ?tCount) (count(distinct ?s) as ?sCount) (count(distinct ?class) as ?cCount) (count(distinct ?p) as ?pCount) ?graphName where {graph ?graphName {?s ?p ?o . optional {?s a ?class . } } } group by ?graphName order by ?graphName } }',
  CLASSES_OVERVIEW : 'select (str(count(?label)) as ?count) ?label where {?x a ?label } group by ?label order by desc(count(?label))',
  PROPERTIES_OVERVIEW: 'select (str(count(?label)) as ?count) ?label where {?x ?label [] } group by ?label order by desc(count(?label))',
  TRIPLES_COUNT : 'SELECT (COUNT(*) AS ?no) { ?s ?p ?o  }',

  CONTRACT_DISTRIBUTION_YEAR: 'SELECT ?label (count(?contract) as ?count) WHERE {?contract a grz-owl:Contract . ?contract event:time ?temp . ?temp time:inXSDDateTime ?date . BIND (year(?date) AS ?label). } GROUP BY ?label',
  CONTRACT_DISTRIBUTION_REGISTER: 'SELECT ?label (count(?contract) as ?count) WHERE {?label a grz-owl:Register ; grz-owl:has_document ?contract . } GROUP BY ?label ',
  FOLIA_DISTRIBUTION_YEAR: 'SELECT ?label (count(?folia) as ?count) WHERE {?contract a grz-owl:Contract . ?contract event:time ?temp . ?temp time:inXSDDateTime ?date . ?contract grz-owl:onPage ?folia . BIND (year(?date) AS ?label) . } GROUP BY ?label',
  FOLIA_DISTRIBUTION_REGISTER: 'SELECT ?label (count(?folia) as ?count) WHERE {?label a grz-owl:Register ; grz-owl:has_folia ?folia . } GROUP BY ?label ',
};