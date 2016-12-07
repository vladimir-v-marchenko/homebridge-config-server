var fs = require('fs');
var jade = require('jade');
var Service = require("hap-nodejs").Service;
var util = require('util');

var Edit = function() {
  this.name = 'edit';
}

Edit.prototype.show = function() {
  var i = 0;  
  var services = [];
  var c = [];
  var service_tmp = [];
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
    i++;
  }

  for(var s in services) {
    var tmp = services[s].characteristics;
    if(tmp) {
      console.log(typeof tmp);
      tmp = tmp.concat(services[s].optionalCharacteristics);

      // remove duplicated characteristics
      for(var j = 0; j < tmp.length; j++) {
        var pointer = tmp[j];
        for(var k = j+1; k < tmp.length; k++) {
          if(pointer.displayName == tmp[k].displayName) {
            tmp.splice(k, 1);
          }
        }
      }
    }
    services[s].characteristics = tmp;
    console.log(util.inspect(services[s].characteristics));
    services[s].optionalCharacteristics = [];
  }

  var config = fs.readFileSync('../config.json', 'UTF-8', function(err, data) {
    if(err) {
      debug('No config file');
      return '';
    }
    return JSON.parse(data);
  });
  
  var j = JSON.parse(config);
  var file = fs.readFile('html/edit.html', 'UTF-8', function(err, data) {
    return {err: err, data: data};
  });
  console.log(file);
  return {err: null, services: services, config: j};
}

exports.Index = Index;
