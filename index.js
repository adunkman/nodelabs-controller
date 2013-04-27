var http = require("http");
var server = http.createServer();
var io = require("socket.io").listen(server);
var port = process.env.PORT || 3000;

io.configure(function () {
  io.set("transports", [ "xhr-polling" ]);
  io.set("polling duration", 10);
})

server.listen(port, function () {
  console.log("server listening on " + port);
});