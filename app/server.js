// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var fs = require('fs');
var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(5000, function() {
  console.log('Starting server on port 5000');
});


var connectedPlayers = 0
var turn_order = []
var colors = ["Aquamarine", "Coral", "Moccasin", "SteelBlue", "AliceBlue"]

// Gamefiles
var new_gameboard = require('./jsonfiles/gameboard.json');
var companygroups = require('./jsonfiles/companygroups.json');
var new_turn = require('./jsonfiles/new_turn.json');
const { SocketAddress } = require('net');
const turn_logic = require('./serverfiles/turn_logic.js');
const action_handler = require('./serverfiles/action_handler.js');
const { nextTurn } = require('./serverfiles/turn_logic.js');

var gamestate = {};
gamestate['gameboard'] = new_gameboard;
gamestate['companygroups'] = companygroups;
gamestate['players'] = {};
gamestate['current_turn'] = new_turn;
gamestate['active'] = false;
gamestate['turn_order'] = {}

io.on('connection', function(socket) {

  socket.emit('id', socket.id)
  socket.emit("current players", gamestate['players']);

  socket.on('new player', function(name) {

    // Stop if the connection already has player,
    // the amount of players is >= 4 or
    // the game is already running.
    if (gamestate['players'][socket.id] != null || connectedPlayers >= 4 || gamestate['active']){
      return
    }

    

    console.log('new player: ' + socket.id)

    gamestate['players'][socket.id] = {
      name: name,
      color: colors[connectedPlayers],
      location: "1",
      hasCar: true,
      capital: 75000
    };

    connectedPlayers += 1
    gamestate['current_turn']['playerID'] = socket.id

    io.sockets.emit("current players", gamestate);
    io.sockets.emit('log', name + " joined the game");
  });

  socket.on('ping', function() {

  });
  

  socket.on('action', function(action, args) {

    var own_turn = gamestate['current_turn']['playerID'] == socket.id;
    var player = gamestate['players'][socket.id] || {};

    if (action == "end turn" && gamestate['current_turn']['hasRolled']){
      turn_logic.nextTurn(gamestate, turn_order)
      io.sockets.emit('log', player.name + " ended his turn");
      return
    }

    var msg = action_handler.performAction(gamestate, player, own_turn, socket.id, action, args);

    if (msg != null){
      io.sockets.emit('log', player.name + " " + msg);
    }

    io.sockets.emit('current players', gamestate)

  });

  socket.on('start game', function() {

    if (connectedPlayers >= 2){
      gamestate['active'] = true
      io.sockets.emit('log', "Spelet börjar");
      turn_order = turn_logic.generateTurnOrder(gamestate);
      gamestate['turn_order'] = turn_order
      io.sockets.emit('current players', gamestate)

      console.log(turn_order)
      console.log(gamestate['turn_order'])
    }

  });


  socket.on('disconnect', function() {

    if (gamestate['active'] && gamestate['current_turn']['playerID'] == socket.id){
      nextTurn(gamestate, turn_order)
    }

    delete gamestate['players'][socket.id]
    turn_order.splice(turn_order.indexOf(socket.id), 1)
    if (connectedPlayers > 1){
      connectedPlayers -= 1
    }
    io.sockets.emit('current players', gamestate)
  });

});



setInterval(function() {
  io.sockets.emit('state', gamestate);
}, 1000/2);


function clone_json(a) {
  return JSON.parse(JSON.stringify(a));
}