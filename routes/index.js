var data = require('../public/data/neighborhoods.json');

exports.view = function(req, res){
  res.render('index');
}

exports.autocomp = function(req, res)
{
	var city_zip = {};
	city_zip["neighborhood"] = [];
	for(var i = 0; i < data.features.length; i++)
	{
		city_zip["neighborhood"].push(data.features[i].properties.NAME);
	}
	res.json({ "cities" : city_zip } );
}
