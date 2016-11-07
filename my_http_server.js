var http = require('http');
var debug = require('debug')('MyHttpServer');
var Service = require("hap-nodejs").Service;
var Accessory = require("hap-nodejs").Accessory;
var fs = require('fs');
var jade = require('jade');
var util = require('util');
var url = require('url') ;
var path = require('path');
var querystring = require('querystring');

function MyHttpServer() {
	this._httpServer = http.createServer();
	this._httpServer.on('request', this._onRequest.bind(this));
	//this._httpServer.on('listening', this._onListening.bind(this));
	//this._httpServer.listen(1337, '127.0.0.1');
	this._httpServer.listen(1337, '192.168.108.219');
	this._name = 'hoge';
}

/*
 * Overwrite config.json
 */
MyHttpServer.prototype._writeConfig = function(config) {
	console.log('writeconf');
	var config_orig = fs.readFileSync('../config.json', 'UTF-8', function(err, data) {
		if(err) {
			debug('No config file');
			return '';
		}
		return JSON.parse(data);
	});
	var jsoncnf = JSON.parse(config_orig);

	jsoncnf['accessories'] = config['accessories'];
	jsoncnf['platforms'] = config['platforms'];
	fs.writeFile('../config.json', JSON.stringify(jsoncnf, null, '    '));
}

/*
 * Routing
 */
MyHttpServer.prototype._onRequest = function(req, res) {
	// get list of accessory information
	// console.log(util.inspect(Service, false, null));
	var reqestPath = path.dirname(req.url);
	var requestFile = path.basename(req.url);

	switch(reqestPath) {
		/*
		 * Load html
		 */
		case '/':
			switch(requestFile) {
				/*
				 * Load submit.jade
				 */
				case 'submit':
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
					fs.readFile('jade/submit.jade', 'UTF-8', function(err, data) {
						if(err) {
							debug('%s', err);
							res.writeHead(404, {'Content-Type': 'text/plain'});
		          res.write('jade not found!');
		          res.end();
						} else {
							var html = jade.renderFile('jade/submit.jade', {data:services, config:j});
							res.writeHead(200, {'Content-Type': 'text/html'});
						  res.end(html);  // 送信完了しないとだめぽい
						}
					});
					break;

				/*
				 * Load index.jade
				 */
				default :
					var i = 0;	
					var services = [];
          var c = [];
					for(var item in Service) {
						// console.log(new Service[item](item, item));
						/* avoid error:
						 * Error: Cannot add a Characteristic with 
						 * the same UUID as another Characteristic 
						 * in this Service: 00000023-0000-1000-8000-0026BB765291
						 * Ignore some services
						 */
						if(item == 'AccessoryInformation' || item == 'TunneledBTLEAccessoryService') continue;
						services[i] = new Service[item](item, item);
            /*
            var tmp = services[i].characteristics;
            if(tmp) {
              console.log(util.inspect(tmp.concat(services[i].optionalCharacteristics)));
              c[i] = tmp.concat(services[i].optionalCharacteristics);
            }
            services[i].characteristics = c.filter(function(x, i, self) {
                                            return self.indexOf(x) === i;
                                         });
            services[i].characteristics = tmp;
            console.log(util.inspect(services[i].characteristics));
            services[i].optionalCharacteristics = [];
						*/
            i++;
            //if(i>4) break;
					}

          for(var s in services) {
            var tmp = services[s].characteristics;
            if(tmp) {
              console.log(typeof tmp);
              tmp = tmp.concat(services[s].optionalCharacteristics);
              //console.log(tmp);
              tmp = tmp.filter(function(x, i, self) {
                                  return self.indexOf(x) === i;
                                 });
            }
            //console.log(typeof tmp);
            console.log(util.inspect(services[s].characteristics));
            services[s].characteristics = tmp;
            //console.log(typeof services[s].characteristics);
            services[s].optionalCharacteristics = [];
            //console.log(service);
          }

					var config = fs.readFileSync('../config.json', 'UTF-8', function(err, data) {
						if(err) {
							debug('No config file');
							return '';
						}
						return JSON.parse(data);
					});
					
					var j = JSON.parse(config);
					fs.readFile('html/index.html', 'UTF-8', function(err, data) {
						if(err) {
							debug('%s', err);
							res.writeHead(404, {'Content-Type': 'text/plain'});
		          res.write('index not found!');
		          res.end();
						} else {
							var html = jade.renderFile('jade/index.jade', {data:services, config:j});
							res.writeHead(200, {'Content-Type': 'text/html'});
						  res.end(html);  // 送信完了しないとだめぽい
						}
					});
					break;
			}
			break;

		case '/css':
			fs.readFile('css/'+requestFile, 'UTF-8', function(err, data) {
				if(err) {
					debug('%s', err);
					res.writeHead(404, {'Content-Type': 'text/plain'});
          res.write('Css file not found');
          res.end();
				} else {
					res.writeHead(200, {'Content-Type': 'text/css'});
				  res.end(data);
				}
			});
			break;

		case '/js':
			fs.readFile('js/'+requestFile, 'UTF-8', function(err, data) {
				if(err) {
					debug('%s', err);
					res.writeHead(404, {'Content-Type': 'text/plain'});
          res.write('JS file not found');
          res.end();
				} else {
					res.writeHead(200, {'Content-Type': 'text/javascript'});
				  res.end(data);
				}
			});
			break;

		default:
			debug('%s', 'routing error');
			res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('Routing error');
      res.end();
      break;
	}
}

MyHttpServer.prototype._onListening = function() {

}

var server = new MyHttpServer();
