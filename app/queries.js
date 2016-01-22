'use strict';

module.exports = {
  generateSearchPersonQuery: function (name) {
    return 'SELECT ?person ?name WHERE {?person a grz-owl:Person . ?person rdfs:label ?name . FILTER (regex(?name, "' + name + '", "i"))}';
  },

  TIMERANGE: 'select MIN(?y) as ?min MAX(?y) as ?max  WHERE {?p a grz-owl:Person . ?cs grz-owl:value ?p . {?cs sem:hasBeginTimeStamp ?d . } UNION {?cs sem:hasTimeStamp ?d . } BIND (year(?d) as ?y) }',

generateSocialGraphQuery: function (minYear, maxYear) {
    return 'SELECT ?person ?relationType ?relation ?connection ?plabel (str(?pg) as ?pgender) ?clabel (str(?cg) as ?cgender) ?start ?end WHERE {?person a grz-owl:Person . OPTIONAL { ?person rdfs:label ?plabel . } OPTIONAL { ?person grz-owl:gender ?pg . } ?person ?relationType ?relation . ?relation a grz-owl:Statement. ?relation grz-owl:value ?connection . ?connection a grz-owl:Person . OPTIONAL { ?connection rdfs:label ?clabel . } OPTIONAL { ?connection grz-owl:gender ?cg . } ?relation sem:hasBeginTimeStamp ?start . OPTIONAL { ?relation sem:hasBeginTimeStamp ?end.} FILTER ((year(?start) > ' + minYear + ' AND year(?start) < ' + maxYear + ') OR (year(?end) > ' + minYear + ' AND year(?end) < ' + maxYear + ')) }';
  },

  GRAPH_OVERVIEW : 'select (str(?tCount) as ?tripleCount) (str(?sCount) as ?distinctSubjectCount) (str(?cCount) as ?distinctClassCount) (str(?pCount) as ?distinctPropertyCount) ?graphName where {{select (count(*) as ?tCount) (count(distinct ?s) as ?sCount) (count(distinct ?class) as ?cCount) (count(distinct ?p) as ?pCount) where {?s ?p ?o . optional {?s a ?class . } } } union {select (count(*) as ?tCount) (count(distinct ?s) as ?sCount) (count(distinct ?class) as ?cCount) (count(distinct ?p) as ?pCount) ?graphName where {graph ?graphName {?s ?p ?o . optional {?s a ?class . } } } group by ?graphName order by ?graphName } }',
  CLASSES_OVERVIEW : 'select (str(count(?label)) as ?count) ?label where {?x a ?label } group by ?label order by desc(count(?label))',
  PROPERTIES_OVERVIEW: 'select (str(count(?label)) as ?count) ?label where {?x ?label [] } group by ?label order by desc(count(?label))',
  TRIPLES_COUNT : 'SELECT (COUNT(*) AS ?no) { ?s ?p ?o  }',

  TOTAL_CONTRACTS_COUNT: 'SELECT count(distinct ?contract) as ?count where {?contract a grz-owl:Contract .}',
  TOTAL_FOLIA_COUNT: 'SELECT count(distinct ?folia) as ?count where {?folia a grz-owl:Page .}',
  AVERAGE_CONTRACTS_NUMBER: 'SELECT (AVG (?contractPerYear) as ?count) WHERE {SELECT COUNT (?contract) AS ?contractPerYear WHERE {?contract a grz-owl:Contract . ?contract sem:hasTimeStamp ?date . BIND (year(?date) AS ?year). } GROUP BY ?year }',

  TOTAL_PERSONS_MENTION_COUNT: 'SELECT count(distinct ?pm) as ?count WHERE {?pm a grz-owl:PersonMention . } ',
  TOTAL_PERSONS_ENTITIES_COUNT: 'SELECT count(distinct ?pe) as ?count WHERE {?pe a grz-owl:Person . } ',
  AVERAGE_PERSON_MENTION_PER_ENTITY: 'SELECT AVG(?mentionCount) as ?count WHERE {SELECT ?pe (count(distinct ?pm) AS ?mentionCount) WHERE {?pm a grz-owl:PersonMention ;  grz-owl:hasEntityLink ?link . ?pe a grz-owl:Person . ?link  grz-owl:refers_to ?pe. } GROUP BY ?pe } ',
};
