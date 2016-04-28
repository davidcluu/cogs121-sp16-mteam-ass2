function generateQueryURL(base, query) {
  var queryURL = base;

  queryURL += '?';

  // Add all query strings in order as part of the GET request URL
  query.forEach(function(queryStr){
    queryURL += 'query=' + queryStr + '&';
  });

  return queryURL;
}

$.get('/autocomp', function(response) {
  $('#srch-term').autocomplete({
    source: response.cities.neighborhood
  });
});

/* On Ready */
$(function() {
  var neighborhoodName = $('#neighborhood').text();
  if (neighborhoodName) {
    $('#crime').html('<strong>Total Crimes Recorded:</strong>');
    $('#cost').html('<strong>Average House Cost:</strong>');
    $('#divider').removeClass('hidden');
  }
});
