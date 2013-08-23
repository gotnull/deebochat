var express = require("express");
var app = express();
var port = 3700;
var io = require("socket.io").listen(app.listen(port));

//app.use(express.static(__dirname + "/public"));

// routing
app.get("/", function (req, res) {
  res.sendfile(__dirname + "/index.html");
});

// pushover notifications
var Pushover = require("node-pushover");
var push = new Pushover({
    token: "<token>",
    user: "<user>"
});

// usernames which are currently connected to the chat
var usernames = {};
var userexists = false;

io.sockets.on("connection", function (socket) {
  // when the client emits "sendchat", this listens and executes
  socket.on("sendchat", function (data) {
    // send pushover notification
    push.send(socket.username, data);
    // we tell the client to execute "updatechat" with 2 parameters
    io.sockets.emit("updatechat", socket.username, data);
  });

  // when the client emits "adduser", this listens and executes
  socket.on("adduser", function (username) {
    // search for existing users
    var userexists = false;
    console.log("Searching existing users..");
    var i = 0;
    for (var user in usernames) {
      if (user == username) {
        userexists = true;
        console.log("User [" + username + "] already exists...");
        i++;
      }

      if (userexists) {
        // user already exists, create new
        username = username + i;
      }
    }

    // we store the username in the socket session for this client
    socket.username = username;
    // add the client"s username to the global list
    usernames[username] = username;
    // echo to client they"ve connected
    socket.emit("updatechat", "SERVER", "you have connected");
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit("updatechat", "SERVER", username + " has connected");
    // update the list of users in chat, client-side
    io.sockets.emit("updateusers", usernames);
  });

  // when the user disconnects.. perform this
  socket.on("disconnect", function () {
    // remove the username from global usernames list
    delete usernames[socket.username];
    // update list of users in chat, client-side
    io.sockets.emit("updateusers", usernames);
    // echo globally that this client has left
    socket.broadcast.emit("updatechat", "SERVER", socket.username + " has disconnected");
  });
});

/*
var passport = require("passport");
var WindowsStrategy = require("passport-windowsauth");
passport.use(function(profile, done) {
	User.findOrCreate({ waId: profile.id }, function (err, user) {
		done(err, user);
	});
});
*/

/*
var file = "/Users/fcusumano.IMMERSIVE/AppData/Roaming/TortoiseSVN/logfile.txt";
file = "/temp/test.txt";

var chokidar = require("chokidar");
var watcher = chokidar.watch(file, { ignored: /^\./, persistent: true });
watcher
  .on("add", function(path) { console.log("File", path, "has been added"); })
  .on("change", function(path) { console.log("File", path, "has been changed"); })
  .on("unlink", function(path) { console.log("File", path, "has been removed"); })
  .on("error", function(error) { console.error("Error happened", error); })

Tail = require("tail").Tail;
tail = new Tail(file);
tail.on("line", function(data) {
	var tailMessage = {
		title: "SVN",
		message: data
  	};
	pushMessage(tailMessage.title, tailMessage.message);
});
*/

console.log("Listening on port " + port);
