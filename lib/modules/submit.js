var Submit = function() {
  this.name = "submit";
}

Submit.prototype.show = function() {
  if (req.method == 'POST') {
    var body = '';
    req.on('data', function(chunk) {
      body += chunk;
    });


    var that = this;
    req.on('end', function(res) {
      console.log('end');
      res = JSON.parse(body);
      that._writeConfig(res);
    });
  }
  var config = fs.readFileSync('../config.json', 'UTF-8', function(err, data) {
    if(err) {
      debug('No config file');
      return '';
    }
    return JSON.parse(data);
  });

  var j = JSON.parse(config);
  fs.readFile('pug/submit.pug', 'UTF-8', function(err, data) {
    if(err) {
      debug('%s', err);
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('pug not found!');
      res.end();
    } else {
      var html = pug.renderFile('pug/submit.pug', {data:services, config:j});
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(html);
    }
  });
}
