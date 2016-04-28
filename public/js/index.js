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
  else {
    $('#chartArea').append('<div id="init-message" class="init-message"><h2>Let\'s get started.</h2><br><p>Click a neighboorhood on the left to see its corresponding house and crime data. Neighborhoods that are greyed out have no accessible data and cannot be selected.</p></div>');
  }
});
