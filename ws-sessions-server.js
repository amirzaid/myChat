const express = require('express');
const session = require('express-session');
const app = express();

const server = require('http').createServer();
const io = require('socket.io')(server, {
    serveClient: true,
    path: '/socket.io/',
    cors: {
        origin: 'http://127.0.0.1:5500'
    }
});

const sessionMiddleware = session({secret: 'keyboard cat', cookie: {maxAge: 60000}});
// register middleware in express
app.use(sessionMiddleware);
// register middleware in socket.io
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

io.on('connection', socket => {
    console.log(socket.id);
    const session = socket.request.session;
    session.connections++;
    session.save();
    socket.on('send-message', (message, room) => {
        if (room === '') {
            socket.broadcast.emit('receive-message', message, socket.id);
        } else {
            socket.to(room).emit('receive-message', message, socket.id);
        }
        console.log(message);
    })
});


httpServer.listen(3000, () => {
    console.log('Server now listening on port 3000');
});