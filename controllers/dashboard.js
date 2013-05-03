var async = require("async");
var dashboard = module.exports = require("express")();

var template = function (user, labs) {
  var html = "<tr><td class=\"username\">" + user.username + "</td>";
  for (var i = 0; i < labs.length; i++) {
    html += "<td class=\"status " +
      (user.completed[labs[i]] ? "completed" : "") +
      "\">&#x2713;</td>";
  };
  html += "</tr>";
  return html;
};

dashboard.get("/status", function (req, res, next) {
  async.parallel({
    labs: req.labs.getLabList,
    users: req.users.findAll.bind(req.users)
  }, function (err, results) {
    if (err) return next(err);

    res.render("dashboard", {
      users: results.users,
      labs: results.labs,
      template: template
    });
  });
});