var http = require("http");
var app = require("express")();
var server = http.createServer(app);
var io = require("socket.io").listen(server);
var port = process.env.PORT || 3000;

io.configure(function () {
  io.set("transports", [ "xhr-polling" ]);
  io.set("polling duration", 10);
});

var mongohq = new (require("./services/mongohq"))();

app.set("view engine", "jade");
app.use(require("connect-assets")());

mongohq.once("connected", function (db) {
  var settings = new (require("./models/settings"))(db);
  var users = new (require("./models/users"))(db);

  app.use(settings.middleware.bind(settings));
  app.use(users.middleware.bind(users));
  app.use(require("./controllers/dashboard"));
  app.use(require("./controllers/settings"));

  settings.on("updated", function () {
    io.sockets.emit("settings", settings.properties);
  });

  io.sockets.on("connection", function (socket) {
    if (settings.initialized) {
      socket.emit("settings", settings.properties);
    }

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