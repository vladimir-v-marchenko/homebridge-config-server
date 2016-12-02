var Accessory = require("hap-nodejs").Accessory;
var fs = require("fs");
var Service = require("hap-nodejs").Service;

function getServices() {
  var services = [];
  for(var item in Service) {
    if(!item || item == 'AccessoryInformation' || item == 'TunneledBTLEAccessoryService') continue;
    services.push(new Service[item](item, item));
  }
  return services;
}

function createServicePage() {
  var services = getServices();
  for(var s in services) {
    var filename = services[s].displayName;
    var data = "# " + filename + "\r\n\r\n";
    for(var d in services[s]) {
      data += "\r\n## " + d + "\r\n\r\n";
      var item = services[s][d];
      if(d != "characteristics" && d != "optionalCharacteristics") {
        if(typeof item === "function") {
          data += "``` \r\n" + item + "\r\n```\r\n\r\n";
        } else {
          data += item + "\r\n\r\n";
        }
      } else {
        for(var c in item) {
          console.log(item[c]);
          data += "- [[" + item[c].displayName + "]]\r\n";
        }
        for(var c in item) {
          data += "\r\n### " + item[c].displayName + "\r\n\r\n";
          /*for(var elem in item[c]) {
            console.log(elem);
            if(elem == "displayName") continue;
            data += "#### " + elem + "\r\n\r\n";
            data += item[c][elem] + "\r\n\r\n";
          }*/
        }
        data += "\r\n";
      }
    }
    fs.writeFile("wiki/" + filename + ".md", data, function(err) {
      if(err) {
        console.log(err);
      }
    });
  }
}

function createHome() {
  var services = getServices();
  var data = "# Home \r\n";
  for(var s in services) {
    data += "- [[" + services[s].displayName + "|" + services[s].displayName + "]]\r\n";
  }
  fs.writeFile("wiki/Home.md", data, function(err) {
    if(err) {
      console.log(err);
    }
  });
}

var create = createServicePage();
var home = createHome();
