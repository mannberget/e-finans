function shuffle(array) {
    var currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}


module.exports = {
    nextTurn: function (gamestate, turn_order){

        index = turn_order.indexOf(gamestate['current_turn']['playerID']) + 1

        if (index < turn_order.length){
            next_player = turn_order[index]
            console.log("next turn: " + gamestate['current_turn']['playerID'])
        } else{
            next_player = turn_order[0]
            console.log("next turn: " + gamestate['current_turn']['playerID'])
        }

        gamestate['current_turn'] = {
            "playerID": next_player,
            "hasRolled": false,
            "hasBoughtProperty": false,
            "hasBoughtStock":false,
            "hasBuilt":false
        }
    },

    generateTurnOrder: function(gamestate){
        var players = Object.keys(gamestate['players']);

        shuffle(players);

        return players;
    }
}
