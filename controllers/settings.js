var express = require("express");
var settings = module.exports = express();
var user = process.env.AUTH_USER || "user";
var password = process.env.AUTH_PASSWORD || "password";

var auth = express.basicAuth(user, password);

settings.get("/admin", auth, function (req, res) {
  var render = function (settings) {
    res.render("settings", { settings: req.settings.properties });
  };

  if (req.settings.initialized) render();
  else req.settings.once("updated", render);
});

settings.post("/admin/:key", auth, function (req, res) {
  var key = req.params.key;
  var value = req.body.value;

  if (value === "false") value = false;
  if (value === "true") value = true;

  req.settings.set(key, value, function () {
    res.redirect("/admin");
  });
});