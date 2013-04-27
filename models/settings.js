var events = require("events");
var util = require("util");

var Settings = module.exports = function (db) {
  this.db = db;

  this._ready = false;
  this.initialized = false;
  this.initialize();
};

util.inherits(Settings, events.EventEmitter);

Settings.prototype.initialize = function () {
  this.db.collection("system", function (err, collection) {
    if (err) throw err;
    
    collection.findOne({ name: "settings" }, function (err, data) {
      if (err) throw err;

      if (data) {
        this.properties = data.properties || {};
        this._ready = true;
        this.initialized = true;
        this.emit("updated");
      }
      else {
        collection.save({ name: "settings" }, function (err, result) {
          if (err) throw err;
          
          this.properties = data.properties || {};
          this._ready = true;
          this.initialized = true;
          this.emit("updated");
        }.bind(this));
      }
    }.bind(this));
  }.bind(this));
};

Settings.prototype.set = function (propName, propValue, callback) {
  if (!this._ready) {
    return this.once("updated", this.set.bind(this, propName, propValue, callback));
  }

  this._ready = false;

  var properties = JSON.parse(JSON.stringify(this.properties));
  properties[propName] = propValue;
  
  this.db.collection("system", function (err, collection) {
    if (err) throw err;

    collection.save({ name: "settings", properties: properties }, function (err, result) {
      if (err) throw err;
      this.properties = properties;
      if (callback) callback(); 
      this.emit("updated");
    }.bind(this));
  }.bind(this));
};

Settings.prototype.get = function (propName, callback) {
  if (!this.initialized) {
    return this.once("updated", this.get.bind(this, propName, callback));
  }

  return callback(null, this.properties[propName]);
};