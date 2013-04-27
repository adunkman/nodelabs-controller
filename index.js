var http = require("http");
var server = http.createServer();
var io = require("socket.io").listen(server);
var mongodb = require("mongodb");
var port = process.env.PORT || 3000;

io.configure(function () {
  io.set("transports", [ "xhr-polling" ]);
  io.set("polling duration", 10);
})

mongodb.MongoClient.connect(process.env.MONGOHQ_URL, function (err, db) {
  if (err) throw err;
  if (!db) throw new Error("Database not found.");

  var settings = new (require("./models/settings"))(db);
  var users = new (require("./models/users"))(db);

  settings.on("updated", function () {
    io.sockets.emit("settings", settings.properties);
  });

  io.sockets.on("connection", function (socket) {
    if (settings.initialized) socket.emit("settings", settings.properties);

    socket.on("username", function (username) {
      users.findOrCreate(username, function (err, user) {
        if (err) throw err;
        socket.emit("user", user);
      });
    });
  });

  server.listen(port, function () {
    console.log("server listening on " + port);
  });
});