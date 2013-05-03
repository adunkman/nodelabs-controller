var express = require("express");
var unlock = module.exports = express();
var labs = require("../labs");
var user = process.env.AUTH_USER || "user";
var password = process.env.AUTH_PASSWORD || "password";

var auth = express.basicAuth(user, password);

unlock.get("/admin/unlock", auth, function (req, res, next) {
  req.users.findAll(function (err, users) {
    if (err) return next(err);
    res.render("unlock", { users: users, labs: labs });
  });
});

unlock.get("/:username/:lab", function (req, res, next) {
  var username = req.params.username;
  var lab = "/" + req.params.lab;
  var now = new Date();

  req.users.findOrCreate(username, function (err, user) {
    if (err) return next(err);

    user.completed = user.completed || {};
    user.completed[lab] = user.completed[lab] || now;

    req.users.save(user, function (err) {
      if (err) return next(err);

      res.send({ message: "Lab " + lab + " completed for user " + username });
    });
  });
});