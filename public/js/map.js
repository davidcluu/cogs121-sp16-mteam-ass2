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
              changeNeighborhoods(displayName, crimes[displayName]);
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
                'fill': '#000',
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
        changeNeighborhoods(neighborhoodName, crimes[neighborhoodName]);
      }
      else {
        console.log("No text"); 
      }

      $('.loader').toggleClass('loaded');
    }
  });
});


function changeNeighborhoods(displayName, crimes) {
  $.getJSON('/data/neighborhoodToZipcode.json', function(map) {
    $('#neighborhood').text(displayName);

    var data = map[displayName];
    if (data) {
      if (data.cost == -1) {
        $('#cost').html("No house cost information for " + displayName + "!");
      }
      else {
        $('#cost').html("<strong>House Cost:</strong> $" + data.cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
      }
    }
    else {
      console.error("No information about " + displayName); 
    }

    $('#crime').html("<strong>Total Crimes:</strong> " + crimes);

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
      updateChart(data, '#zipcode-crime');
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


function updateChart (data, id) {
  $(id).empty();

  var range = d3.max( data.map(function(d){ return parseInt(d.count); }) ) + 100;

  var margin = {top: 0, right: 0, bottom: 50, left: 60},
      width = $('#crime').width() - margin.right - margin.left,
      height = ($(window).height() - $('#zipcode-crime').position().top) / 2.1 - margin.top - margin.bottom;

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
    .style("fill", "#aaa");

  var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
  var yAxis = d3.svg.axis().scale(yScale).orient("left");

  chart
    .append("g")
      .attr("transform", "translate(" + 0 + "," + innerHeight + ")")
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
      .call(yAxis);
}
