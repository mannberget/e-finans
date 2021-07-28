var socket = io();

var myID;

var action = {
  name: "unknown",
  up: false,
  down: false,
  left: false,
  right: false,
  endTurn: false
}

document.getElementById("playerNameSend").addEventListener("click", function() {
  socket.emit('new player', document.getElementById("playerName").value);
});

document.getElementById("roll").addEventListener("click", function() {
  socket.emit('action', "roll");
});

document.getElementById("endTurn").addEventListener("click", function() {
  socket.emit('action', "end turn");
});



setInterval(function() {
  socket.emit('ping');
}, 1000);

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 800;
var context = canvas.getContext('2d');

socket.on('id', function(id) {
  myID = id
  console.log(myID)
});

socket.on('state', function(gamestate) {
  console.log(gamestate)

  context.clearRect(0, 0, 800, 800);

  var tiles = gamestate['gameboard']['tiles']

  draw_tiles(context, tiles, gamestate)

  var players = gamestate['players']

  draw_player(context, players, gamestate);
});

socket.on('current players', function(players){
  draw_player_portraits(players)

  document.getElementById('playerJoin').style.display = 'block';

  for (var id in players) {
    if (myID == id){
      document.getElementById('playerJoin').style.display = 'none';
    }
  }

});

socket.on('log', function(message){
  var li = document.createElement("li");
  li.innerHTML = message
  document.getElementById('log').appendChild(li)
  li.scrollIntoView()
});




function wrapText(context, text, x, y, maxWidth, lineHeight) {
  var words = text.split(' ');
  var line = '';

  for(var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    var metrics = context.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    }
    else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}



function draw_player(context, players, gamestate) {
  for (var id in players) {
      var player = players[id];

      var location = player.location
      var tile = gamestate['gameboard']['tiles'][location]

      var player_x = tile.x + tile.w/2
      var player_y = tile.y + (2*tile.h/3)

      context.fillStyle = player.color;
      context.beginPath();

      context.arc(player_x, player_y, 20, 0, 2 * Math.PI);
      context.fill();
  
      context.lineWidth = 1;
      context.fillStyle = 'Black';
      context.font = "14px Arial"
      context.textAlign = "center"
      context.fillText(player.name, player_x, player_y+5);
  
      if (gamestate['current_turn']['playerID'] == id){
        context.lineWidth = 3;
        context.strokeStyle = 'Green';
        context.stroke();
      }
  
      if (myID == id){
        context.lineWidth = 1;
        context.fillStyle = 'Black';
        context.font = "14px Arial"
        context.textAlign = "center"
        context.fillText("You", player_x, player_y - 20);
      }
  }
}

function draw_player_portraits(players) {

  var ul = document.getElementById("player-portraits");

  ul.innerHTML = "" // Clear portraits

  for (var id in players) {
      var player = players[id];

      var li = document.createElement("li");
      li.innerHTML = '<div class="card"> <div class="avatar-image"></div> <div class="container"> <b>' + player.name + '</b> <br/> Architect & Engineer </div> </div>'
      ul.appendChild(li)
  }
}

function draw_tiles(context, tiles, gamestate){
  for (var nr in tiles) {
    var tile = tiles[nr]

    if (tile.type == "property"){
      if (tile.companygroup != null){
        context.beginPath();
        context.fillStyle = gamestate['companygroups'][tile.companygroup]['color'];
        context.fillRect(tile.x, tile.y, tile.w, tile.h)
      }

      context.lineWidth = 1;
      context.fillStyle = 'blue';
      context.font = "12px Courier"
      context.textAlign = "center"
      var price_string = tile.price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
      context.fillText(price_string, tile.x + tile.w/2, tile.y + (5*tile.h/6));      

    } else if (tile.type == "bank"){
      context.beginPath();
      context.fillStyle = "#F9F3D8";//"Moccasin";
      context.fillRect(tile.x, tile.y, tile.w, tile.h)

    } else if (tile.type == "tips"){
      context.beginPath();
      context.fillStyle = "#F8BF95";//"Moccasin";
      context.fillRect(tile.x, tile.y, tile.w, tile.h)
    } else if (tile.type == "newspaper"){
      context.beginPath();
      context.fillStyle = "#A6D2F2";//"Moccasin";
      context.fillRect(tile.x, tile.y, tile.w, tile.h)
    } else if (tile.type == "prison"){
      context.beginPath();
      context.fillStyle = "#B3B4B6";//"Moccasin";
      context.fillRect(tile.x, tile.y, tile.w, tile.h)
    } 

    // Draw border
    context.lineWidth = 1;
    context.beginPath();
    context.strokeStyle = "black";
    context.strokeRect(tile.x, tile.y, tile.w, tile.h)


    // Draw Title
    context.lineWidth = 1;
    context.fillStyle = 'black';
    context.font = "12px Courier"
    context.textAlign = "center"
    wrapText(context, tile.title, tile.x + tile.w/2, tile.y + tile.h/4, tile.w, 10);

    // Draw tile number
    context.lineWidth = 1;
    context.fillStyle = 'black';
    context.font = "10px Courier"
    context.textAlign = "right"
    context.fillText(nr, tile.x + tile.w - 2, tile.y + tile.h/8);   
  }
}