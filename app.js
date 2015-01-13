var index = function(req, res) {
    res.writeHead(200);
    return res.end();
};

var app = require('http').createServer(index);
var io = require('socket.io')(app);
var _ = require('lodash');

app.listen(3001);

var entities = {};

io.on('connection', function(socket) {
    socket.emit('id', { id: socket.id });

    _.forEach(entities, function(entity) {
        socket.emit('new', entity);
    });

    socket.on('new', function(data) {
        data.id = socket.id;
        entities[socket.id] = data;
        io.emit('new', data);
    });

    socket.on('position', function(data) {
        if (!entities[socket.id]) return;

        entities[socket.id].position = data.position;
        io.emit('position', { id: socket.id, position: data.position });
    });

    socket.on('disconnect', function() {
        io.emit('delete', { id: socket.id });
        delete entities[socket.id];
    });
});
