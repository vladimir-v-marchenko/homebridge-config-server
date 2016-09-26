var Service, Characteristic;
var debug = require('debug')('MultiAccessory');
var exec = require("child_process").exec;
var config;

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-multi", "Multi", MultiAccessory);
}

function MultiAccessory(log, config){
  debug('load multi');
	for(var conf in config) {
    this[conf] = config[conf];
  }
  this.config = config;
}

MultiAccessory.prototype = {
  cmdExec: function(cmd, callback) {
    exec(cmd,function(error, stdout, stderr) {
        callback(error, stdout, stderr);
        debug('command:' + cmd);
        //this.log(cmd+' exec');
    });
  },

  setPowerState: function(on, off, powerOn, callback) {
		var cmd;

    if (powerOn) {
      cmd = on;
      //this.log("Setting power state to on");
    } else {
      cmd = off;
      //this.log("Setting power state to off");
    }

    
    this.cmdExec(cmd, function(error, stdout, stderr) {
      if (error) {
        debug('power function failed: %s', stderr);
        callback(error);
      } else {
        debug('power function succeeded!');
        callback();
      }
    }.bind(this));
  },

  identify: function(callback) {
    this.log("Identify requested!");
    callback();
  },

  getServices: function() {
    var informationService = new Service.AccessoryInformation();
    informationService.setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
                      .setCharacteristic(Characteristic.Model, this.model)
                      .setCharacteristic(Characteristic.SerialNumber, this.serial);

    // Set Service
    var cmdService = new Service[this.service](this.Name, this.Name);
		console.log(this.Name);

    // Set characteristics
    for(var conf in this.config) {
      if(conf == 'Name' || conf == 'Off') continue;
			var chars = cmdService.getCharacteristic(Characteristic[conf]);
      if(conf == 'On') {
        var command = this.config[conf].command;
        var off_cmd = this.config.Off;
				if(chars) {
        	chars.on('set', this.setPowerState.bind(this, command, off_cmd));
        	//chars.on('set', this.setPowerState.bind(this, this, command, off_cmd));
        }
				continue;
      }
      if(chars) {
				chars.on(this.config[conf].behavior, this.cmdExec.bind(this, this.config[conf].command));
i			}
    }

		console.log(cmdService);
    return [cmdService];
  }
};
