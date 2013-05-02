var updateUI = function (users) {
  var html = "";
  
  for (var i = 0; i < users.length; i++) {
    html += window.template(users[i], window.labs);
  };

  $("tbody").html(html);
};

$(document).ready(function () {
  var socket = io.connect('http://nodelabs.herokuapp.com:80');
  //var socket = io.connect('http://localhost:3000');

  socket.on("connect", function () {
    socket.emit("dashboard");
  });

  socket.on("users", function (users) {
    updateUI(users);
  });
});
