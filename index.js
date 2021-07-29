var express = require('express');

var app = express();
var server = app.listen(3000);

console.log("The Server is Running");

app.use(express.static('public'));

var socket = require('socket.io');

var io = socket(server);

io.sockets.on('connection', newConnection);

let connections = 0
let players = new Map();

/** newConnection takes a socket and handles a new connection
 * @param socket socket*/
function newConnection(socket) {
    console.log('new connection: ' + socket.id);
    connections++

    players[socket.id] = connections

    socket.broadcast.emit('processedID', players[socket.id])
    
    socket.on('playerMoved', (data) => {
        socket.broadcast.emit('enemyMoved', data)
    })

    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id);
        players.delete(socket.id)
        connections--
    })
}