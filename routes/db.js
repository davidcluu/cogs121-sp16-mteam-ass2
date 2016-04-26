exports.query = function (req, res) {
  var query = req.query.query;

  if (!query) {
    console.error("DB Query Error: Empty query");

    res.sendStatus(500);
    return;
  }

  req.dbclient.query(queryize(query), function(err, result) {
    if(err) {
      console.error("DB Query Error");
      console.error(err);

      res.sendStatus(500);
      return;
    }

    res.json(result.rows);
  });

  function queryize (queryArr) {
    return queryArr
      .map(function(s) { return s + ' '; })
      .reduce(function(p,c) { return p+c; })
  }
}
