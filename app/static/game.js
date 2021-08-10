var socket = io();

var myID;

var lastGameState;

var hidePlayers = false;

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

document.getElementById("rollAndGo").addEventListener("click", function() {
  socket.emit('action', "rollAndGo");
});

document.getElementById("rollOne").addEventListener("click", function() {
  socket.emit('action', "roll", 1);
});

document.getElementById("rollTwo").addEventListener("click", function() {
  socket.emit('action', "roll", 2);
});

document.getElementById("startGame").addEventListener("click", function() {
  socket.emit('start game')
});

document.getElementById("endTurn").addEventListener("click", function() {
  socket.emit('action', "end turn");
});

document.getElementById("hidePlayers").addEventListener("click", function() {
  hidePlayers = !hidePlayers;
});

document.getElementById("buyProperty").addEventListener("click", function() {
  socket.emit('action', "buyProperty", document.getElementById("properties").value);
});

document.getElementById("sellProperty").addEventListener("click", function() {
  socket.emit('action', "sellProperty", document.getElementById("properties").value);
});

document.getElementById("loanProperty").addEventListener("click", function() {
  socket.emit('action', "loanProperty", document.getElementById("properties").value);
});

document.getElementById("unLoanProperty").addEventListener("click", function() {
  socket.emit('action', "unLoanProperty", document.getElementById("properties").value);
});

document.getElementById("buildProperty").addEventListener("click", function() {
  socket.emit('action', "buildProperty", document.getElementById("properties").value);
});

document.getElementById("bankDeposit").addEventListener("click", function() {
  socket.emit('action', "bankDeposit", document.getElementById("bank-control-amount").value);
});

document.getElementById("transferMoney").addEventListener("click", function() {
  socket.emit('action', "transferMoney", [document.getElementById("transfer-control-players").value, document.getElementById("transfer-amount").value]);
});

document.getElementById("bankWithdraw").addEventListener("click", function() {
  socket.emit('action', "bankWithdraw", document.getElementById("bank-control-amount").value);
});

document.getElementById("sellCar").addEventListener("click", function() {
  socket.emit('action', "sellCar");
});

document.getElementById("buyCar").addEventListener("click", function() {
  socket.emit('action', "buyCar");
});

document.getElementById("goTo").addEventListener("click", function() {
  socket.emit('action', "goTo", document.getElementById("goToSquare").value);
});

document.getElementById('properties').addEventListener('change', function() {
  document.getElementById('property-display').style.visibility = "visible";

  property = lastGameState['gameboard']['tiles'][this.value];

  if (property.companygroup != null){
    companygroup = lastGameState['companygroups'][property.companygroup]
    document.getElementById('property-company-group').innerHTML = companygroup.name;
    document.getElementById('property-company-group').style.backgroundColor = companygroup.color;
  } else {
    document.getElementById('property-company-group').innerHTML = "";
    document.getElementById('property-company-group').style.backgroundColor = "#FFFFFF";
  }
  
  document.getElementById('property-name').innerHTML = property.title.replace('- ', '');

  document.getElementById('property-cost').innerHTML = format_amount(property.price);
  document.getElementById('property-build-cost').innerHTML = format_amount(property.build_price);

  document.getElementById('property-rent').innerHTML = format_amount(property.rent);
  document.getElementById('property-rent-built').innerHTML = format_amount(property.rent_built);

  document.getElementById('property-loan').innerHTML = format_amount(property.loan);
  document.getElementById('property-loan-built').innerHTML = format_amount(property.loan_built);

  document.getElementById('property-sell').innerHTML = format_amount(property.sell);
  document.getElementById('property-sell-built').innerHTML = format_amount(property.sell_built);

  
});


function format_amount(price){
  if (price == 0)
    return '-';

  return price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
}

function draw_house(ctx, start_x, start_y){
  ctx.beginPath();
  ctx.fillStyle = "Red";
  ctx.moveTo(start_x, start_y);
  ctx.lineTo(start_x, start_y-8);
  ctx.lineTo(start_x+5, start_y-12);
  ctx.lineTo(start_x+10, start_y-8);
  ctx.lineTo(start_x+10, start_y);
  ctx.fill();
}


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

  if (gamestate['active']){
    var tiles = gamestate['gameboard']['tiles']

    draw_tiles(context, tiles, gamestate)

    var players = gamestate['players']

    draw_player(context, players, gamestate);
  }


});

socket.on('current players', function(gamestate){
  lastGameState = gamestate;

  var players = gamestate['players']

  if (gamestate['active']){
    document.getElementById('startupScreen').style.display = 'none';
    document.getElementById('log').style.display = 'block';
    draw_player_portraits(gamestate)

    if (document.getElementById('properties').innerHTML == ""){
      populate_property_selector(gamestate);
    }
    if (document.getElementById('transfer-control-players').innerHTML == ""){
      populate_transfer_selector(gamestate)
    }
  }else{
    draw_player_startup(players)
  }

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


function populate_property_selector(gamestate){
  document.getElementById('properties').innerHTML = "";
  var tiles = gamestate['gameboard']['tiles'];
  for (var nr in tiles){
    var tile = tiles[nr];

    if (tile.type == "property"){
      var option = document.createElement('option');
      option.value = nr;
      option.innerHTML = tile.title.replace('- ', '');
      document.getElementById('properties').appendChild(option)
    }
  }
}

function populate_transfer_selector(gamestate){
  document.getElementById('transfer-control-players').innerHTML = "";
  var players = gamestate['players']
  for (var id in players){
    var player = gamestate['players'][id];
    var option = document.createElement('option');
    option.value = id;
    option.innerHTML = player.name
    document.getElementById('transfer-control-players').appendChild(option)
  }
}

function draw_player(context, players, gamestate) {


  var ids = gamestate['turn_order']

  for (var id in ids) {
      var player = players[gamestate['turn_order'][id]];

      var location = player.location
      var tile = gamestate['gameboard']['tiles'][location]

      var player_x = tile.x + tile.w/2 - 10 + id*5
      var player_y = tile.y + (2*tile.h/3) - 6 + id*3;

      

      if (hidePlayers){
        context.strokeStyle = player.color;
        context.beginPath();
        context.arc(player_x, player_y, 20, 0, 2 * Math.PI);
        context.lineWidth = 1;
        context.stroke();

      } else {
        context.fillStyle = player.color;
        context.beginPath();

        context.arc(player_x, player_y, 20, 0, 2 * Math.PI);
        context.fill();
    
        context.lineWidth = 1;
        context.fillStyle = 'Black';
        context.font = "14px Arial"
        context.textAlign = "center"
        context.fillText(player.name, player_x, player_y+5);
    
        if (gamestate['current_turn']['playerID'] == gamestate['turn_order'][id]){
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
}

function draw_player_portraits(gamestate) {

  var ids = gamestate['turn_order'];

  console.log("players: " + ids)

  var players = gamestate['players']

  var ul = document.getElementById("player-portraits");

  ul.innerHTML = "" // Clear portraits

  for (var id in ids) {
      var player = players[gamestate['turn_order'][id]];

      var li = document.createElement("li");
      li.innerHTML = '<div class="card" style="border: 5px solid ' + player.color + ';"> <div class="avatar-image"></div> <div class="container"> <b>' + player.name + '</b> <br/>Capital: ' + player.capital.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '</div> </div>'
      ul.appendChild(li)
  }
}

function draw_player_startup(players) {

  var ul = document.getElementById("player-join-list");

  ul.innerHTML = "" // Clear list

  for (var id in players) {
      var player = players[id];

      var li = document.createElement("li");
      li.innerHTML = player.name
      ul.appendChild(li)
  }
}

function draw_tips(context, tiles, gamestate){
  
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
      context.fillText(format_amount(tile.price), tile.x + tile.w/2, tile.y + (5*tile.h/6));      

      if (tile.owner != ""){
        try {
          context.lineWidth = 4;
          context.beginPath();
          context.strokeStyle = gamestate['players'][tile.owner]['color'];
          context.strokeRect(tile.x+2, tile.y+2, tile.w-4, tile.h-4)
        } catch (error) {
        }

        if (tile.built){
          draw_house(context, tile.x+tile.w-15, tile.y + tile.h - 5);
        }

        if (tile.mortgaged){
          try {
            context.beginPath();
            context.fillStyle = "rgba(0, 0, 0, 0.5)";
            context.fillRect(tile.x+4, tile.y+4, tile.w-8, tile.h-8)
          } catch (error) {
          }
        }
      }

    } else if (tile.type == "bank"){
      context.beginPath();
      context.fillStyle = "#F9F3D8";
      context.fillRect(tile.x, tile.y, tile.w, tile.h)

    } else if (tile.type == "tips"){
      context.beginPath();
      context.fillStyle = "#F8BF95";
      context.fillRect(tile.x, tile.y, tile.w, tile.h)
    } else if (tile.type == "newspaper"){
      context.beginPath();
      context.fillStyle = "#A6D2F2";
      context.fillRect(tile.x, tile.y, tile.w, tile.h)
    } else if (tile.type == "prison"){
      context.beginPath();
      context.fillStyle = "#B3B4B6";
      context.fillRect(tile.x, tile.y, tile.w, tile.h)
    }

    context.lineWidth = 1;
    context.beginPath();
    context.strokeStyle = "Black";
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