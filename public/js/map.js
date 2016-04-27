var parentWidth = window.innerWidth,
    parentHeight = window.innerHeight;

var margin = ((parentWidth > parentHeight) ? parentWidth : parentHeight) / 25,
    width = parentWidth - (2 * margin),
    height = parentHeight - (2 * margin);

var svg = d3.select('#map').append('svg')
    .attr('width', width + margin)
    .attr('height', height + margin);


d3.json('/data/sd.json', function (err, sd) {
  if(err) console.error(err);

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
  svg.append('path')
      .datum(sdgeo)
      .attr('d', path)
      .attr('transform', 'translate(' + margin + ',' + margin + ')');

  svg.selectAll('.neighborhood')
      .data(sdgeo.features)
      .enter().append('path')
      .attr('d', path)
      .attr('class', function(d) {
        return 'neighborhood ' + d.properties.name;
      })
      .style('fill', handleFill)


  /* Load zipcode to neighborhood mapper */
  $.getJSON('/data/zipcodeToNeighborhood.json', function(data){
    console.log(data);
  });
});


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

/*
  subplaces = topojson.feature(sd, sd.objects.neighborhoods);

  var projection = d3.geo.mercator();
  var path = d3.geo.path().projection(projection);

  var features = subplaces.features;
  for (var i = 0; i < features.length; i++) {
      var feat = features[i];
      
      // calculate the centroid (which is in pixels) and then invert back to lat/long
      var centroid = projection.invert(path.centroid(feat));

      // output: id, long, lat
      console.log('{name: "' + feat.properties.name + '", centroid:[' + centroid[1] + ', ' + centroid[0] + ']},');
  }
*/
