module.exports = {
    performAction: function(gamestate, player, action, args) {
        console.log("player " + player.name + " performed action " + action)


        if (action == "roll"){

            if (gamestate['current_turn']['hasRolled'] == false){
            
                var start = parseInt(player.location);

                var roll = Math.floor( Math.random() * 6 ) +1;

                // Add another dice if player has a car and is not in bank
                if (start < 34 && player.hasCar){
                    roll += Math.floor( Math.random() * 6 ) +1;
                }

                console.log(player.name + " rolled: " + roll.toString());

                var new_location = (((start + roll) - 1) % (Object.keys(gamestate['gameboard']['tiles']).length)) + 1

                if (start < 34 && new_location >= 34){
                    new_location = 34;
                }

                if (new_location < start){
                    new_location = 1;
                }
                
                gamestate['current_turn']['hasRolled'] = true

                player.location = new_location.toString()
                
                return "rolled " + roll.toString();

            }
        } else if (action == "buy"){
            if (gamestate['current_turn']['hasRolled'] == false && gamestate['current_turn']['hasBoughtProperty'] == false){
                var property = gamestate['gameboard']['tiles'][args];
                
                if (player.capital >= property.price){
                    property.owner = gamestate['current_turn']['playerID'];
                    player.capital -= property.price;
                    gamestate['current_turn']['hasBoughtProperty'] = true;
                }
                return "bought " + property.title;
            }
        } else {
            console.log("Undefined action: " + action)
        }
    }
}