var dashboard = module.exports = require("express")();
var labs = require("../labs");

var template = function (user, labs) {
  var html = "<tr><td>" + user.username + "</td>";
  for (var i = 0; i < labs.length; i++) {
    html += "<td class=\"status " + 
      (user.completed["/" + labs[i]] ? "completed" : "") + 
      "\">&#x2713;</td>";
  };
  html += "</tr>";
  return html;
};

dashboard.get("/", function (req, res, next) {
  req.users.findAll(function (err, users) {
    if (err) return next(err);

    res.render("dashboard", { users: users, labs: labs, template: template });
  });
});