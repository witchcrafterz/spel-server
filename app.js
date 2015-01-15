var index = function(req, res) {
    res.writeHead(200);
    return res.end();
};

var app = require('http').createServer(index);
var io = require('socket.io')(app);
var _ = require('lodash');

app.listen(3001);

var entities = {};
var actionQueue = {};

io.on('connection', function(socket) {
    console.log('New client connected', socket.id);

    socket.emit('id', { id: socket.id });

    _.forEach(entities, function(entity) {
        socket.emit('new', entity);
    });

    socket.on('new', function(data) {
        console.log('New player created', socket.id);

        data.id = socket.id;
        entities[socket.id] = data;
        io.emit('new', data);
    });

    socket.on('position', function(data) {
        if (!entities[socket.id]) return;

        entities[socket.id].position = data.position;
        io.emit('position', { id: socket.id, position: data.position });
    });

    socket.on('action', function(data) {
        if (!entities[socket.id]) return;

        console.log('Received action', socket.id);

        if (!actionQueue[socket.id]) actionQueue[socket.id] = [];

        actionQueue[socket.id].push(data);
    });

    socket.on('disconnect', function() {
        console.log('Player disconnected', socket.id);

        io.emit('delete', { id: socket.id });
        delete entities[socket.id];
    });
});

function sendAction() {
    io.emit('action', actionQueue);
    actionQueue = {};

    setTimeout(sendAction, 50);
}

setTimeout(sendAction, 50);
