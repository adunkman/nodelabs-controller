var request = require("request");
var labsHost = process.env.LABS_HOST || "localhost";
var labsPort = process.env.LABS_PORT || 4000;
var labsUrl = "http://" + labsHost +
  (labsPort == 80 ? "" : ":" + labsPort) + "/workshop/labs.json";

var labs = module.exports = function (req, res, next) {
  req.labs = { getLabList: getLabList };
  next();
};

var getLabList = function (callback) {
  request.get({ url: labsUrl, json: true }, function (err, response, labs) {
    if (err) return callback(err);
    else if (response.statusCode >= 400) return callback(response);
    else return callback(null, labs);
  });
};