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
		debug('call cmdExec');
    exec(cmd,function(error, stdout, stderr) {
        debug('command:' + cmd);
				debug('callback:'+callback);
        callback(error, stdout, stderr);
        //this.log(cmd+' exec');
    });
  },

  setPowerState: function(on, off, powerOn, callback) {
		var cmd;
		debug('call setPowerState');

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
        callback(stdout);
      }
    }.bind(this));
  },

  getState: function(cmd, callback) {
    debug('cmd:' + cmd);
    debug('callback:' + callback);

    this.cmdExec(cmd, function(error, stdout, stderr) {
      if (error) {
        debug('get state failed: %s', stderr);
        callback(error);
      } else {
        debug('get state succeeded!');
				debug('stdout:' + stdout);
        callback(null, stdout);
      }
    }.bind(this));
  },

  identify: function(callback) {
    this.log("Identify requested!");
    callback();
  },

  getServices: function() {
		debug('call getService');
    var informationService = new Service.AccessoryInformation();
    informationService.setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
                      .setCharacteristic(Characteristic.Model, this.model)
                      .setCharacteristic(Characteristic.SerialNumber, this.serial);

    // Set Service
    var cmdService = new Service[this.service](this.Name, this.Name);

		debug('cmdS:'+this.service);
    // Set characteristics
    for(var conf in this.config) {
			//conf = conf.replace(/\s+/g, "");
      if(conf == 'Name' || conf == 'Off') continue;
			var chars = cmdService.getCharacteristic(Characteristic[conf.replace(/\s+/g, "")]);
			debug("chars:"+chars);
			debug("conf:"+conf);
			console.log(chars);
      if(conf == 'On') {
        var command = this.config[conf].command;
        var off_cmd = this.config.Off;
				if(chars) {
        	chars.on('set', this.setPowerState.bind(this, command, off_cmd));
        	//chars.on('set', this.setPowerState.bind(this, this, command, off_cmd));
        }
      } else if(chars) {
				console.log(this.config);
        var behavior = this.config[conf].behavior;
        var command = this.config[conf].command;
				if(behavior == 'get') {
					debug('get:'+ command);
          chars.on(behavior, this.getState.bind(this, command));
          //chars.on(behavior, this.getState.bind(command));
        } else {
          chars.on(behavior, this.cmdExec.bind(this, command));
					debug('set:'+ command);
        }
			}
    }

    return [cmdService];
  }
};
