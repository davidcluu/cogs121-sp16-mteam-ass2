/* On Ready */
(function(d3) {
  'use strict';

  /* Query strings sorted in an array */
  var query = [
    "SELECT COUNT(*)",
    "FROM cogs121_16_raw.arjis_crimes AS c",
    "WHERE NOT(c.zip LIKE '')"
  ];

  d3.json(generateQueryURL('/delphidata', query), function(err, data) {
    console.log(data);
    if (err) {
      console.error(err);
      return;
    }

    d3.json('/data/zipcodeToNeighborhood.json', function(err, map) {
      if (err) {
        console.error(err);
        return;
      }

      console.log();

      data.forEach(function(data){
        if (map[data.zip]) {

        }
      });
    });
  });

  d3.json('/data/zipcodeToNeighborhood.json', function(err, map) {
    var keys = Object.keys(map);

    for (var i in keys) {
      (function (currZipCode) {
        var query = [
          "SELECT COUNT(*)",
          "FROM cogs121_16_raw.arjis_crimes AS c",
          "WHERE c.zip LIKE '" + currZipCode + "'"
        ];

        d3.json(generateQueryURL('/delphidata', query), function(err, data) {
          if (err) {
            console.error(err);
            return;
          }

          console.log(map[currZipCode] + " - " + data[0].count);
        });
      })(keys[i]);
    }
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
