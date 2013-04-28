var express = require("express");
var settings = module.exports = express();
var user = process.env.AUTH_USER || "user";
var password = process.env.AUTH_PASSWORD || "password";

settings.use(express.basicAuth(user, password));

settings.get("/settings", function (req, res) {
  var render = function (settings) {
    res.render("settings", { settings: req.settings.properties });
  };
  
  if (req.settings.initialized) render();
  else req.settings.once("updated", render);
});

settings.post("/settings/:key", function (req, res) {
  var key = req.params.key;
  var value = req.body.value;

  if (value === "false") value = false;
  if (value === "true") value = true;

  req.settings.set(key, value, function () {
    res.redirect("/settings");
  });
});