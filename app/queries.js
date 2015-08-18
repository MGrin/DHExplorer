'use strict';

module.exports = {
  GRAPH_OVERVIEW : 'select (str(?tCount) as ?tripleCount) (str(?sCount) as ?distinctSubjectCount) (str(?cCount) as ?distinctClassCount) (str(?pCount) as ?distinctPropertyCount) ?graphName where {{select (count(*) as ?tCount) (count(distinct ?s) as ?sCount) (count(distinct ?class) as ?cCount) (count(distinct ?p) as ?pCount) where {?s ?p ?o . optional {?s a ?class . } } } union {select (count(*) as ?tCount) (count(distinct ?s) as ?sCount) (count(distinct ?class) as ?cCount) (count(distinct ?p) as ?pCount) ?graphName where {graph ?graphName {?s ?p ?o . optional {?s a ?class . } } } group by ?graphName order by ?graphName } }',
  CLASSES_OVERVIEW : 'select (str(count(?label)) as ?count) ?label where {?x a ?label } group by ?label order by desc(count(?label))',
  PROPERTIES_OVERVIEW: 'select (str(count(?label)) as ?count) ?label where {?x ?label [] } group by ?label order by desc(count(?label))',
  TRIPLES_COUNT : 'SELECT (COUNT(*) AS ?no) { ?s ?p ?o  }',

  CONTRACT_DISTRIBUTION_YEAR: 'SELECT ?label (count(?contract) as ?count) WHERE {?contract a grz-owl:Contract . ?contract sem:hasTime ?temp . ?temp sem:hasTimeStamp ?date . BIND (year(?date) AS ?label). } GROUP BY ?label ORDER BY asc(?label)',
  CONTRACT_DISTRIBUTION_REGISTER: 'SELECT ?label (count(?contract) as ?count) WHERE {?label a grz-owl:Register ; grz-owl:has_document ?contract . } GROUP BY ?label ',
  FOLIA_DISTRIBUTION_YEAR: 'SELECT ?label (count(?folia) as ?count) WHERE {?contract a grz-owl:Contract . ?contract sem:hasTime ?temp . ?temp sem:hasTimeStamp ?date . ?contract grz-owl:appearsOn ?folia . BIND (year(?date) AS ?label) . } GROUP BY ?label ORDER BY asc(?label)',
  FOLIA_DISTRIBUTION_REGISTER: 'SELECT ?label (count(?folia) as ?count) WHERE {?label a grz-owl:Register ; grz-owl:has_folia ?folia . } GROUP BY ?label ',

  TOTAL_CONTRACTS_COUNT: 'SELECT count(distinct ?contract) as ?count where {?contract a grz-owl:Contract .}',
  TOTAL_FOLIA_COUNT: 'SELECT count(distinct ?folia) as ?count where {?folia a grz-owl:Folia .}',
  AVERAGE_CONTRACTS_NUMBER: 'SELECT (AVG (?contractYear) as ?count) WHERE {SELECT count(?contract) AS ?contractYear WHERE {?contract a grz-owl:Contract . ?contract sem:hasTime ?temp . ?temp sem:hasTimeStamp ?date . BIND (year(?date) AS ?year). } GROUP BY ?year } ',

  PERSON_MENTION_DISTRIBUTION_ROLE: 'SELECT ?label (count(distinct ?pm) as ?count) WHERE {?pm a grz-owl:PersonMention ; tis:hasTimeIndexedSetting ?tx . ?tx tis:isSettingFor ?role . ?role grz-owl:roleType ?label . } GROUP BY ?label',
  PERSON_MENTION_DISTRIBUTION_ENTITY: 'SELECT ?person ?label (count(distinct ?pm) as ?count) WHERE {?pm a grz-owl:PersonMention ; grz-owl:hasEntityLink ?link . ?link grz-owl:refers_to ?person . ?person a grz-owl:Person ; rdfs:label ?label . } GROUP BY ?person ?label ORDER BY desc(?count)',

  TOTAL_PERSONS_MENTION_COUNT: 'SELECT count(distinct ?pm) as ?count WHERE {?pm a grz-owl:PersonMention . } ',
  TOTAL_PERSONS_ENTITIES_COUNT: 'SELECT count(distinct ?pe) as ?count WHERE {?pe a grz-owl:Person . } ',
  AVERAGE_PERSON_MENTION_PER_ENTITY: 'SELECT AVG(?mentionCount) as ?count WHERE {SELECT ?pe (count(distinct ?pm) AS ?mentionCount) WHERE {?pm a grz-owl:PersonMention ;  grz-owl:hasEntityLink ?link . ?pe a grz-owl:Person . ?link  grz-owl:refers_to ?pe. } GROUP BY ?pe } ',

  generateContractsPerMonth: function (year) {
    return 'SELECT ?label (count(?contract) as ?count) WHERE {?contract a grz-owl:Contract . ?contract sem:hasTime ?temp . ?temp sem:hasTimeStamp ?date . BIND (year(?date) AS ?year) . FILTER (?year = ' + year + ') . BIND(month(?date) as ?label)} GROUP BY ?label ORDER BY asc(?label)';
  },
  generateContractsPerDay: function (year, month) {
    return 'SELECT ?label (count(?contract) as ?count) WHERE {?contract a grz-owl:Contract . ?contract sem:hasTime ?temp . ?temp sem:hasTimeStamp ?date . BIND (year(?date) AS ?year) . BIND (month(?date) as ?month) FILTER (?year = ' + year + ') . FILTER(?month = ' + month + ') . BIND(day(?date) as ?label)} GROUP BY ?label ORDER BY asc(?label)';
  },
  generateFoliaPerMonth: function (year) {
    return 'SELECT ?label (count(?folia) as ?count) WHERE {?contract a grz-owl:Contract . ?contract sem:hasTime ?temp . ?temp sem:hasTimeStamp ?date . ?contract grz-owl:appearsOn ?folia . BIND (year(?date) AS ?year) . FILTER (?year = ' + year + ') . BIND(month(?date) as ?label)} GROUP BY ?label ORDER BY asc(?label)';
  },
  generateFoliaPerDay: function (year, month) {
    return 'SELECT ?label (count(?folia) as ?count) WHERE {?contract a grz-owl:Contract . ?contract sem:hasTime ?temp . ?temp sem:hasTimeStamp ?date . ?contract grz-owl:appearsOn ?folia . BIND (year(?date) AS ?year) . BIND(month(?date) as ?month) . FILTER (?year = ' + year + ') . FILTER(?month = ' + month + ') BIND(day(?date) as ?label)} GROUP BY ?label ORDER BY asc(?label)';
  }
};
