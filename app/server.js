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
gamestate['gameboard'] = new_gameboard
gamestate['companygroups'] = companygroups
gamestate['players'] = {};
gamestate['current_turn'] = new_turn

io.on('connection', function(socket) {

  socket.emit('id', socket.id)
  socket.emit("current players", gamestate['players']);

  socket.on('new player', function(name) {

    if (gamestate['players'][socket.id] != null || connectedPlayers >= 4){
      return
    }

    

    console.log('new player: ' + socket.id)

    gamestate['players'][socket.id] = {
      x: (80 * (connectedPlayers + 2)),
      y: (20 * (connectedPlayers + 2)),
      name: name,
      color: colors[connectedPlayers],
      location: "1"
    };
    connectedPlayers += 1
    gamestate['current_turn']['playerID'] = socket.id

    turn_order = turn_logic.generateTurnOrder(gamestate);

    io.sockets.emit("current players", gamestate['players']);
  });

  socket.on('ping', function() {

  });
  

  socket.on('end turn', function() {
    if (gamestate['current_turn']['playerID'] == socket.id){
      turn_logic.nextTurn(gamestate, turn_order)
    }
  });

  socket.on('action', function(action) {

    if (gamestate['current_turn']['playerID'] == socket.id){
      var player = gamestate['players'][socket.id] || {};

      action_handler.performAction(gamestate, player, action)
    }

  });


  socket.on('disconnect', function() {

    if (gamestate['current_turn']['playerID'] == socket.id){
      nextTurn(gamestate, turn_order)
    }

    delete gamestate['players'][socket.id]
    turn_order.splice(turn_order.indexOf(socket.id), 1)
    if (connectedPlayers > 1){
      connectedPlayers -= 1
    }
    io.sockets.emit('current players', gamestate['players'])
  });

});



setInterval(function() {
  io.sockets.emit('state', gamestate);
}, 1000 / 5);
