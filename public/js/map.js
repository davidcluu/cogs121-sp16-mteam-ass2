var parentWidth = $('#map').width(),
    parentHeight = window.innerHeight;

var margin = 50,
    width = parentWidth - (2 * margin),
    height = parentHeight - (2 * margin);

var svg = d3.select('#map').append('svg')
    .attr('width', width)
    .attr('height', height);


$.getJSON('/data/sd.json', function(sd) {
  /* Retrieve features from the sd object */
  var sdgeo = topojson.feature(sd, sd.objects.neighborhoods);

  /* Calculate the center of sd, guess scale and offset */
  var center = d3.geo.centroid(sdgeo);
  var scale = 150;
  var offset = [width/2, height/2];
  var projection = d3.geo.mercator()
                      .scale(scale)
                      .center(center)
                      .translate(offset);

  var path = d3.geo.path()
                .projection(projection);

  /* Use calculated results to fix offset and scale */
  var bounds = path.bounds(sdgeo);
  var hscale = scale*width  / (bounds[1][0] - bounds[0][0]);
  var vscale = scale*height / (bounds[1][1] - bounds[0][1]);
  var scale  = (hscale < vscale) ? hscale : vscale;
  var offset  = [width + margin/2 - (bounds[0][0] + bounds[1][0])/2,
                 height + margin/2 - (bounds[0][1] + bounds[1][1])/2];

  projection = d3.geo.mercator()
                  .center(center)
                  .scale(scale)
                  .translate(offset);

  path = path.projection(projection);


  /* Draw the neighborhood objects */
  svg.selectAll('.neighborhood')
      .data(sdgeo.features)
      .enter().append('path')
      .attr('d', path)
      .attr('class', handleClass)
      .style('fill', '#e8e8e8')
      .style('cursor', 'not-allowed');

  $.getJSON('/data/neighborhoodToZipcode.json', function(map) {
    var keys = Object.keys(map);

    var neighborhoodsCounted = 0;
    var crimes = {};

    for (var i in keys) {
      (function (currNeighborhood) {
        var zipCodesCounted = 0;
        var totalCrimes = 0;

        for (var j in map[keys[i]].zipcodes) {
          (function (currZipCode) {
            var query = [
              "SELECT COUNT(*)",
              "FROM cogs121_16_raw.arjis_crimes AS c",
              "WHERE c.zip LIKE '" + currZipCode + "'"
            ];

            $.getJSON(generateQueryURL('/delphidata', query), function(data) {
              zipCodesCounted = zipCodesCounted + 1;
              totalCrimes = totalCrimes + parseInt(data[0].count);

              if(zipCodesCounted == map[currNeighborhood].zipcodes.length) {
                crimes[currNeighborhood] = totalCrimes;
                neighborhoodsCounted = neighborhoodsCounted + 1;

                if (neighborhoodsCounted == keys.length) {
                  setClick(crimes);
                }
              }
            });
          })(map[keys[i]].zipcodes[j]);
        }
      })(keys[i]);
    }

    function setClick(crimes) {
      for (var i in keys) {
        var name = keys[i].replace(/\s+/g, '-').toLowerCase();

        (function (displayName, className) {
          var ratio = crimes[displayName] / 5000;

          var r = Math.floor( 255 * (ratio) + 250 * (1.0-ratio) );
          var g = Math.floor( 0   * (ratio) + 237 * (1.0-ratio) );
          var b = Math.floor( 255 * (ratio) + 250 * (1.0-ratio) );

          $('.neighborhood.' + className)
            .click(function() {
              $('.currentSelection').removeClass('currentSelection');
              changeNeighborhoods(displayName, crimes[displayName]);
              $(this).addClass('currentSelection');
            })
            .css({
              'cursor': 'pointer'
            })
            .css({
              'fill': 'rgb(' + r + ',' + g + ',' + b + ')',
              'transition': '2.0s'
            })
            .hover(function() {
              $(this).css({
                'fill': 'rgb(120,0,120)',
                'transition': '0.5s'
              });
            }, function() {
              $(this).css({
                'fill': 'rgb(' + r + ',' + g + ',' + b + ')'
              });
            });
        })(keys[i], name);
      }

      var neighborhoodName = $('#neighborhood').text();
      if (neighborhoodName) {
        var className = neighborhoodName.replace(/\s+/g, '-').toLowerCase();
        $('.neighborhood.' + className).addClass('currentSelection');

        changeNeighborhoods(neighborhoodName, crimes[neighborhoodName]);
      }

      $('.loader').toggleClass('loaded');
    }
  });
});


function changeNeighborhoods(displayName, crimes) {
  $.getJSON('/data/neighborhoodToZipcode.json', function(map) {
    var init = $('#init-message');
    if (init) {
      init.addClass('hidden');
    }

    $('#neighborhood').text(displayName);

    $('#crime').html("<strong>Total Crimes Recorded:</strong> " + crimes);

    var data = map[displayName];
    var housePrices;
    if (data) {
      if (data.cost == -1) {
        housePrices = [
          {
            cost: '0',
            locality: displayName
          },
          {
            cost: "567950",
            locality: "San Diego"
          }
        ]
        $('#cost').html("No house cost information for " + displayName + "!");
      }
      else {
        $('#cost').html("<strong>Average House Cost:</strong> $" + data.cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        housePrices = [
          {
            cost: data.cost.toString(),
            locality: displayName
          },
          {
            cost: "567950",
            locality: "San Diego"
          }
        ]
      }
    }
    else {
      console.error("No information about " + displayName);
      housePrices = [
        {
          cost: '0',
          locality: displayName
        },
        {
          cost: "567950",
          locality: "San Diego"
        }
      ]
    }

    $('#divider').removeClass('hidden');
    $('#stats').removeClass('hidden');


    var query = [
      "SELECT zip,COUNT(*)",
      "FROM cogs121_16_raw.arjis_crimes AS c"
    ];

    for (var i in data.zipcodes) {
      if (i == 0) {
        query.push("WHERE c.zip LIKE '" + data.zipcodes[i] + "'");
      }
      else {
        query.push("OR c.zip LIKE '" + data.zipcodes[i] + "'");
      }
    }

    query.push("GROUP BY zip");

    $.getJSON(generateQueryURL('/delphidata', query), function(data) {
      updateHouseChart(housePrices, '#houseprices');
      updateCrimeChart(data, '#zipcode-crime');
    });
  });
}


function handleClass(d) {
  var name = d.properties.name.replace(/\s+/g, '-').toLowerCase();

  return 'neighborhood ' + name;
}


function handleFill(d) {
  return hashColor(d.properties.name);

  /* Creates a psudorandom color from the input string's hashCode */
  function hashColor(s) {
    var hash = hashCode();

    var r = (hash & 0xFF0000) >> 16;
    var g = (hash & 0x00FF00) >> 8;
    var b = (hash & 0x0000FF);

    return rgbToHex(r,g,b);

    /* Implementation of Java String hashCode() */
    function hashCode() {
      var hash = 0, i, chr, len;
      if (s.length === 0) return hash;
      for (i = 0, len = s.length; i < len; i++) {
        chr   = s.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0;
      }
      return hash;
    }

    /* Takes in three integers corresponding to (r,g,b) values and retuns the hex color */
    function rgbToHex(r, g, b) {
      return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);

      function componentToHex(c) {
          var hex = c.toString(16);
          return hex.length == 1 ? '0' + hex : hex;
      }
    }
  }
}


function updateCrimeChart (data, id) {
  $(id).empty();
  $(id + '-label').empty();

  var range = d3.max( data.map(function(d){ return parseInt(d.count); }) ) + 100;

  var margin = {top: 0, right: 0, bottom: 50, left: 100},
      width = $('#crime').width() - margin.right - margin.left,
      height = ($(window).height() - $('#zipcode-crime').position().top) / 3 - margin.top - margin.bottom;

  var innerWidth  = width  - margin.left - margin.right;
  var innerHeight = height - margin.top  - margin.bottom;

  var xScale = d3.scale.ordinal().rangeRoundBands([0, innerWidth], 0);
  var yScale = d3.scale.linear().range([0, innerHeight]);

  var chart = d3
                .select(id)
                .append("svg")
                .attr("width", width + margin.right + margin.left)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" +  margin.left + "," + margin.right + ")");

  xScale.domain( data.map(function (d){ return d.zip; }) );

  yScale.domain([range,0]);
  
  chart
    .selectAll(".bar")
    .data(data.map(function(d){ return d.count; }))
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d, i) { return ((innerWidth / data.length)*i) + 5; })
    .attr("width", (innerWidth / data.length) - 10)
    .attr("y", function(d) { return innerHeight - (innerHeight*(d / range)); })
    .attr("height", function(d) { return innerHeight*(d / range); })
    .style("fill", "#6AC1DE");

  var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
  var yAxis = d3.svg.axis().scale(yScale).orient("left");

  chart
    .append("g")
      .attr("transform", "translate(" + 0 + "," + innerHeight + ")")
      .style({ 'stroke': 'Black', 'fill': 'none', 'stroke-width': '1px' })
      .call(xAxis)
    .selectAll("text")
      .attr("transform",
        "translate(" + 0 + "," + 10 + ")" +
        " " +
        "rotate(" + -45 + ")"
      )
      .style("text-anchor", "end");

  chart
    .append("g")
      .style({ 'stroke': 'Black', 'fill': 'none', 'stroke-width': '1px' })
      .call(yAxis);

  $(id + '-label').html('<h2 style="text-align: center; font-weight: bold;">Zip Code vs. Crimes Recorded</h2>');
}

function updateHouseChart (data, id) {
  $(id).empty();

  var range = 100000 * Math.ceil((d3.max( data.map(function(d){ return parseInt(d.cost); }) ))/100000) - 70000;

  var margin = {top: 0, right: 0, bottom: 50, left: 100},
      width = $('#crime').width() - margin.right - margin.left,
      height = ($(window).height() - $('#zipcode-crime').position().top) / 2.5 - margin.top - margin.bottom;

  var innerWidth  = width  - margin.left - margin.right;
  var innerHeight = height - margin.top  - margin.bottom;

  var xScale = d3.scale.ordinal().rangeRoundBands([0, innerWidth], 0);
  var yScale = d3.scale.linear().range([0, innerHeight]);

  var chart = d3
                .select(id)
                .append("svg")
                .attr("width", width + margin.right + margin.left)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" +  margin.left + "," + margin.right + ")");

  xScale.domain( data.map(function (d){ return d.locality; }) );

  yScale.domain([range,0]);
  
  chart
    .selectAll(".bar")
    .data(data.map(function(d){ return d.cost; }))
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d, i) { return ((innerWidth / data.length)*i) + 5; })
    .attr("width", (innerWidth / data.length) - 10)
    .attr("y", function(d) { return innerHeight - (innerHeight*(d / range)); })
    .attr("height", function(d) { return innerHeight*(d / range); })
    .style("fill", "#99D681");

  var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
  var yAxis = d3.svg.axis().scale(yScale).orient("left");

  chart
    .append("g")
      .attr("transform", "translate(" + 0 + "," + innerHeight + ")")
      .style({ 'stroke': 'Black', 'fill': 'none', 'stroke-width': '1px' })
      .call(xAxis)
    .selectAll("text")
      .attr("transform",
        "translate(" + 0 + "," + 10 + ")" +
        " " +
        "rotate(" + -45 + ")"
      )
      .style("text-anchor", "end");

  chart
    .append("g")
      .style({ 'stroke': 'Black', 'fill': 'none', 'stroke-width': '1px' })
      .call(yAxis);

  $(id + '-label').html('<h2 style="text-align: center; font-weight: bold;">House Prices compared to San Diego Average</h2>');
}
