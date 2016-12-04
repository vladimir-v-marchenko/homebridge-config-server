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
        callback(null, stdout);
      }
    }.bind(this));
  },

  getState: function(cmd, callback) {
    debug('cmd:' + cmd);

    this.cmdExec(cmd, function(error, stdout, stderr) {
      if (error) {
        debug('get state failed: %s', stderr);
        callback(error);
        //callback();
      } else {
        debug('get state succeeded!');
				debug('stdout:' + stdout);
        callback(null, Number(stdout));
      }
    }.bind(this));
  },

  setState: function(characteristic, cmd, state, callback) {

    this.cmdExec(cmd, function(error, stdout, stderr) {
      if (error) {
        debug('set state failed: %s', stderr);
        callback(error);
      } else if(!stdout) {
        callback();
      } else {
        characteristic.setValue(stdout);
        debug('set state succeeded!');
				debug('stdout:' + stdout);
        callback();
      }
    }.bind(this));
  },

  identify: function(callback) {
    //this.log("Identify requested!");
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

    // Set characteristics
    var getCommand;
    for(var conf in this.config) {
      if(conf == 'Name'|| conf == 'Off' || conf == 'accessory' || conf == 'service' || conf == 'name') continue;

			var chars = cmdService.getCharacteristic(Characteristic[conf.replace(/\s+/g, "")]);
      if(conf == 'On') {
        var command = this.config[conf].command;
        var off_cmd = this.config.Off;
				if(chars) {
        	chars.on('set', this.setPowerState.bind(this, command, off_cmd));
        }
      } else if(chars) {
        //var behavior = this.config[conf].behavior;
        //var command = this.config[conf].command;
        var get = this.config[conf].get;
        var set = this.config[conf].set;
				if(get) {
          chars.on('get', this.getState.bind(this, command));
        }
        if(set) {
          chars.on('set', this.setState.bind(this, chars, command));
          //chars.on('get', this.getState.bind(this, 'cat /home/pi/test1.txt'))
        }
			}
    }

    return [cmdService];
  }
};
