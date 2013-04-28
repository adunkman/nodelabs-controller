var events = require("events");
var util = require("util");

var Users = module.exports = function (db) {
  this.db = db;
};

util.inherits(Users, events.EventEmitter);

Users.prototype.findOrCreate = function (username, callback) {
  this.db.collection("users", function (err, collection) {
    if (err) return callback(err);

    collection.findOne({ username: username }, function (err, user) {
      if (err) return callback(err);

      if (user) {
        return callback(null, user);
      }
      else {
        user = { username: username, completed: {} };

        collection.save(user, function (err, result) {
          if (err) return callback(err);
          this.findOrCreate(username, callback);
        }.bind(this));
      }
    }.bind(this));
  }.bind(this));
};

Users.prototype.save = function (user, callback) {
  this.db.collection("users", function (err, collection) {
    if (err) return callback(err);
    collection.save(user, function (err, result) {
      if (err) return callback(err);
      this.emit("userUpdated", user);
      return callback();
    }.bind(this));
  }.bind(this));
};

Users.prototype.middleware = function (req, res, next) {
  req.users = this;
  next();
};