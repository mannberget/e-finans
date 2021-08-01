module.exports = {
    performAction: function(gamestate, player, own_turn, id, action, args) {
        console.log("player " + player.name + " performed action " + action)


        if (action == "roll"){

            if (own_turn && gamestate['current_turn']['hasRolled'] == false){
            
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
                
                return "gick fram " + roll.toString();

            }
        } else if (action == "buyProperty"){
            if (own_turn &&
                gamestate['current_turn']['hasRolled'] == false &&
                parseInt(player.location) >= 34 &&
                gamestate['current_turn']['hasBoughtProperty'] == false){
                var property = gamestate['gameboard']['tiles'][args];
                
                if (property.owner == "" && player.capital >= property.price){
                    property.owner = gamestate['current_turn']['playerID'];
                    player.capital -= property.price;
                    gamestate['current_turn']['hasBoughtProperty'] = true;
                    return "köpte " + property.title;
                }
                
            }
        } else if (action == "sellProperty"){
            var property = gamestate['gameboard']['tiles'][args];
            var built = property.built;

            if (built == false && property.sell == 0){
                return
            }

            if (built && property.sell_built == 0){
                return
            }
            
            if (property.owner == id &&
                property.mortgaged == false){
                property.owner = "";
                if (built){
                    player.capital += property.sell_built;
                } else {
                    player.capital += property.sell;
                }
                property.built = false;
                return "sålde " + property.title;
            }
                
        } else if (action == "loanProperty"){
            var property = gamestate['gameboard']['tiles'][args];
            var built = property.built;

            if (built == false && property.loan == 0){
                return
            }

            if (built && property.loan_built == 0){
                return
            }
            
            if (property.owner == id &&
                property.mortgaged == false){
                property.mortgaged = true;
                if (built){
                    player.capital += property.loan_built;
                } else {
                    player.capital += property.loan;
                }
                return "belånade " + property.title;
            }
                
        } else if (action == "unLoanProperty"){
            var property = gamestate['gameboard']['tiles'][args];
            var built = property.built;
            var price_to_unLoan = 0;

            if (built){
                price_to_unLoan = Math.floor(property.loan_built * 1.1)
            } else {
                price_to_unLoan = Math.floor(property.loan * 1.1)
            }
            
            if (property.owner == id &&
                property.mortgaged == true &&
                player.capital >= price_to_unLoan){

                player.capital -= price_to_unLoan;
                property.mortgaged = false;

                return "löste upp " + property.title;
            }
                
        } else if (action == "buildProperty"){
            var property = gamestate['gameboard']['tiles'][args];
            var built = property.built;

            var location = parseInt(player.location);

 
            if (property.owner == id &&
                (location == 17 || location == 40) &&
                property.mortgaged == false &&
                player.capital >= property.build_price){

                player.capital -= property.build_price;
                property.built = true;
                
                return "byggde på " + property.title;
            }
                
        } else {
            console.log("Undefined action: " + action)
        }
    }
}