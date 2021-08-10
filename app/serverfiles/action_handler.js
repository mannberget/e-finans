module.exports = {
    performAction: function(gamestate, player, own_turn, id, action, args) {
        console.log("player " + player.name + " performed action " + action + " with args " + args)


        if (action == "rollAndGo"){

            if (own_turn && gamestate['current_turn']['hasRolled'] == false){
            
                var start = parseInt(player.location);

                var roll1 = Math.floor( Math.random() * 6 ) +1;
                
                var roll = 0;

                var twoDice = (start < 34 && player.hasCar)

                // Add another dice if player has a car and is not in bank
                if (twoDice){
                    var roll2 = Math.floor( Math.random() * 6 ) +1;
                    var roll = roll1 + roll2;
                } else {
                    var roll = roll1;
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
                
                if (twoDice){
                    return "gick fram " + roll.toString() + " (" + roll1 + "+" + roll2 + ")";
                } else {
                    return "gick fram " + roll.toString()
                }

            }
        } else if (action == "roll"){

            if (args == 1){
                var roll1 = Math.floor( Math.random() * 6 ) +1;
                return "rullade " + roll1.toString()
            }

            if (args == 2){
                var roll1 = Math.floor( Math.random() * 6 ) +1;
                var roll2 = Math.floor( Math.random() * 6 ) +1;
                var roll = roll1 + roll2;
                return "rullade " + roll.toString() + " (" + roll1 + "+" + roll2 + ")";
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
                
        } else if (action == "bankDeposit"){
            var amount = parseInt(args);
            if (isNaN(amount)) { return; }

            if (player.capital >= amount){
                player.capital -= amount
                return "satte in " + amount + " i banken"
            }

                
        } else if (action == "bankWithdraw"){
            var amount = parseInt(args);
            if (isNaN(amount)) { return; }

            player.capital += amount
            return "tog ut " + amount + " från banken"
                
        } else if (action == "transferMoney"){
            if (id == args[0]){
                console.log("Cant transfer to self")
                return
            }

            var to_player = gamestate['players'][args[0]];
            var amount = parseInt(args[1]);
            if (isNaN(amount)) {
                console.log("Amount is not valid")
                return
            }

            if (player.capital >= amount){
                player.capital -= amount
                to_player.capital += amount
                return "överförde " + amount + " till " + to_player.name
            }
                
        } else if (action == "buyCar"){

            if (player.hasCar == false && player.capital >= 50000){
                player.capital -= 50000
                player.hasCar = true
                return "köpte bil för 50.000"
            }
                
        } else if (action == "sellCar"){

            if (player.hasCar == true){
                player.capital += 25000
                player.hasCar = false
                return "sålde sin bil för 50.000"
            }
                
        } else if (action == "goTo"){
            var square = parseInt(args);
            if (isNaN(square)) { return; }

            player.location = square.toString()

            return "transporterade sig till ruta " + square.toString()
                
        } else {
            console.log("Undefined action: " + action)
        }
    }
}