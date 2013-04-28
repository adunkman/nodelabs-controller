var mongodb = require("mongodb");
var util = require("util");
var events = require("events");

var MongoHQ = module.exports = function () {
  this.connect(process.env.MONGOHQ_URL);
};

util.inherits(MongoHQ, events.EventEmitter);

MongoHQ.prototype.connect = function (mongourl) {
  mongodb.MongoClient.connect(mongourl, function (err, db) {
    if (err) return this.emit("error", err);
    else return this.emit("connected", db);
  }.bind(this));
};