var Accessory = require("hap-nodejs").Accessory;
var fs = require("fs");
var Service = require("hap-nodejs").Service;

function getServices() {
  var services = [];
  for(var item in Service) {
    if(item == 'AccessoryInformation' || item == 'TunneledBTLEAccessoryService') continue;
    services.push(new Service[item](item, item));
  }
  return services;
}

function createServicePage() {
  var services = getServices();
  for(var s in services) {
    var filename = services[s].displayName;
    console.log(s); 
    console.log(services[s]);
    var data = "# " + filename + "\r\n";
    for(var d in services[s]) {
      console.log(d);
      console.log(s[d]);
      data += "## " + d + "\r\n";
    }
    fs.writeFile(filename + ".md", data, function(err) {
      if(err) {
        console.log(err);
      }
    });
  }
}

var create = createServicePage();
