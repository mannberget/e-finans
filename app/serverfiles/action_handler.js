module.exports = {
    performAction: function(gamestate, player, action) {
        console.log("player " + player.name + " performed action " + action)


        if (action == "roll"){

            var start = parseInt(player.location);
            var roll = Math.floor( Math.random() * 6 ) +1;
            console.log(player.name + " rolled: " + roll.toString());

            var new_location = (start + roll) % Object.keys(gamestate['gameboard']['tiles']).length

            player.location = new_location.toString()
        }
    }
}