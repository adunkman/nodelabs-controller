var http = require("http");
var server = http.createServer();
var io = require("socket.io").listen(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log("server listening on " + port);
});