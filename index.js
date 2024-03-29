var http = require("http");
var express = require("express");
var app = express();
var server = http.createServer(app);
var io = require("socket.io").listen(server);
var port = process.env.PORT || 4040;

io.configure(function () {
  io.set("transports", [ "xhr-polling" ]);
  io.set("polling duration", 10);
});

var mongohq = new (require("./services/mongohq"))();

app.set("view engine", "jade");
app.use(express.bodyParser());
app.use("/admin", require("connect-assets")({ servePath: "/admin" }));

mongohq.once("connected", function (db) {
  var userToSocket = {};
  var dashboards = [];
  var settings = new (require("./models/settings"))(db);
  var users = new (require("./models/users"))(db);

  app.use(settings.middleware.bind(settings));
  app.use(users.middleware.bind(users));
  app.use(require("./services/labs"));
  app.use(require("./controllers/dashboard"));
  app.use(require("./controllers/unlock"));
  app.use(require("./controllers/settings"));

  app.use(function (err, req, res, next) {
    console.error(err);
    next(err);
  });

  var updateDashboards = function () {
    users.findAll(function (err, userList) {
      if (err) throw err;

      for (var i = 0; i < dashboards.length; i++) {
        var socketId = dashboards[i];
        io.sockets.sockets[socketId].emit("users", userList);
      };
    });
  };

  settings.on("updated", function () {
    io.sockets.emit("settings", settings.properties);
  });

  users.on("userUpdated", function (user) {
    var usersSockets = userToSocket[user.username];
    updateDashboards();

    if (!usersSockets) return;

    for (var i = 0; i < usersSockets.length; i++) {
      var socketId = usersSockets[i];
      io.sockets.sockets[socketId].emit("user", user);
    };
  });

  io.sockets.on("connection", function (socket) {
    if (settings.initialized) {
      socket.emit("settings", settings.properties);
    }

    socket.on("username", function (username) {
      users.findOrCreate(username, function (err, user) {
        if (err) throw err;

        userToSocket[username] = userToSocket[username] || [];
        userToSocket[username].push(socket.id);

        updateDashboards();
        socket.emit("user", user);
      });
    });

    socket.on("dashboard", function () {
      dashboards.push(socket.id);
    });

    socket.on("disconnect", function () {
      for (var username in userToSocket) {
        for (var i = 0; i < userToSocket[username].length; i++) {
          var socketId = userToSocket[username][i];
          if (socket.id == socketId) {
            userToSocket[username].splice(i, 1);
          }
        };
      }

      for (var i = 0; i < dashboards.length; i++) {
        var socketId = dashboards[i];
        if (socket.id == socketId) {
          dashboards.splice(i, 1);
        }
      }
    });
  });

  server.listen(port, function () {
    console.log("server listening on " + port);
  });
});
