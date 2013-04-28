var dashboard = module.exports = require("express")();

dashboard.get("/", function (req, res) {
  res.end("Some dashboard here");
});