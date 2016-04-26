/* On Ready */
(function(d3) {
  'use strict';

  /* Query strings sorted in an array */
  var query = [
    'SELECT gender, number_of_respondents',
    'FROM cogs121_16_raw.cdph_smoking_prevalence_in_adults_1984_2013 AS c',
    'WHERE c.year = 2003'
  ];

  d3.json(generateQueryURL('/delphidata', query), function(err, data) {
    if (err) {
      console.error(err);
      return;
    }

    var sortedData = data.sort(function(a, b) {
      return a.gender.charCodeAt(0) - b.gender.charCodeAt(0);
    });

    console.log(sortedData);
  });
})(d3);

function generateQueryURL(base, query) {
  var queryURL = base;

  queryURL += '?';

  // Add all query strings in order as part of the GET request URL
  query.forEach(function(queryStr){
    queryURL += 'query=' + queryStr + '&';
  });

  return queryURL;
}
