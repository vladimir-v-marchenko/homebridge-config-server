var conf = require('config');
var http = require('http');
var debug = require('debug')('HomebridgeConfig');
var Service = require("hap-nodejs").Service;
var Accessory = require("hap-nodejs").Accessory;
var fs = require('fs');
var jade = require('jade');
var util = require('util');
var url = require('url') ;
var path = require('path');
var querystring = require('querystring');
var edit = require('./modules/edit');
var os = require('os');

var HomebridgeConfig = function() {
  this._httpServer = http.createServer();
  this._httpServer.on('request', this._onRequest.bind(this));
  this._httpServer.listen(1337, getLocalIPAddress());
  this._name = 'homebridge_config';
  this.homeDir = process.env.HOME ? process.env.HOME:'/home/pi';
}

function getLocalIPAddress() {
  var interfaces = os.networkInterfaces();
  for(var dev in interfaces) {
    interfaces[dev].forEach(function(details) {
      if (!details.internal){
        if(details.family == 'IPv4') return details.address;
      }
    });
  }
  return '';
}

/*
 * Overwrite config.json
 */
HomebridgeConfig.prototype._writeConfig = function(config) {
  var config_orig = fs.readFileSync(this.homeDir + '/.homebridge/config.json', 'UTF-8', function(err, data) {
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
HomebridgeConfig.prototype._onRequest = function(req, res) {
  // get list of accessory information
  var requestPath = path.dirname(req.url);
  var requestFile = path.basename(req.url);

  switch(requestPath) {
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
              res = JSON.parse(body);
              that._writeConfig(res);
            });
          }
          var config = fs.readFileSync(this.homeDir + '_/.homebridge/config.json', 'UTF-8', function(err, data) {
            if(err) {
              debug('No config file');
              return '';
            }
            return JSON.parse(data);
          });

          var j = JSON.parse(config);
          fs.readFile(__dirname + '/jade/submit.jade', 'UTF-8', function(err, data) {
            if(err) {
              debug('%s', err);
              res.writeHead(404, {'Content-Type': 'text/plain'});
              res.write('jade not found!');
              res.end();
            } else {
              var html = jade.renderFile(__dirname + '/jade/submit.jade', {data:services, config:j});
              res.writeHead(200, {'Content-Type': 'text/html'});
              res.end(html);
            }
          });
          break;

        /*
         * load edit.jade
         */
        case 'edit' :
          var idx = new edit.Edit();
          var returns = idx.show();
          if(returns.err) {
            debug('%s', returns.err);
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.write('index not found!');
            res.end();
          } else {
            var html = jade.renderFile(__dirname + '/jade/edit.jade', {data:returns.services, config:returns.config});
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(html);
          }
          break;

        /*
         * Load index.jade
         */
        default:
          var config = fs.readFileSync(this.homeDir + '/.homebridge/config.json', 'UTF-8', function(err, data) {
            if(err) {
              debug('No config file');
              return '';
            }
            return JSON.parse(data);
          });

          var j = JSON.parse(config);
          fs.readFile(__dirname + '/jade/index.jade', 'UTF-8', function(err, data) {
            if(err) {
              debug('%s', err);
              res.writeHead(404, {'Content-Type': 'text/plain'});
              res.write('jade not found!');
              res.end();
            } else {
              var html = jade.renderFile(__dirname + '/jade/index.jade', {data:services, config:j});
              res.writeHead(200, {'Content-Type': 'text/html'});
              res.end(html);
            }
          });
          break;
      }
      break;

    case '/css':
      fs.readFile('../css/'+requestFile, 'UTF-8', function(err, data) {
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
      fs.readFile('../js/'+requestFile, 'UTF-8', function(err, data) {
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

      case '/api/services':
        switch(requestFile) {
          case 'all':
            var i = 0;  
            var services = [];
            for(var item in Service) {
              /* avoid error:
               * Error: Cannot add a Characteristic with 
               * the same UUID as another Characteristic 
               * in this Service: 00000023-0000-1000-8000-0026BB765291
               * Ignore some services
               */
              if(item == 'AccessoryInformation' || item == 'TunneledBTLEAccessoryService') continue;
              services[i] = new Service[item](item, item);
              i++;
            }
            res.writeHead(200, {'Content-Type': 'text/json'});
            var data = JSON.stringify(services);
            res.end(data);

            break;

          default:
            var service = new Service[requestFile](requestFile, requestFile);
            res.writeHead(200, {'Content-Type': 'text/json'});
            var data = JSON.stringify(service);
            res.end(data);
            break;
        }
        break;

    default:
      debug('%s', 'routing error');
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('Routing error');
      res.end();
      break;
  }
}

HomebridgeConfig.prototype._onListening = function() {

}

exports.HomebridgeConfig = HomebridgeConfig;
