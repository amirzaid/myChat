const http = require("http");
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.static(__dirname));
app.use(cors());

const httpServer = http.createServer(app);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/messages.html')
});

const io = require('socket.io')(httpServer, {
    serveClient: true,
    path: '/socket.io/',
    cors: {
        origin: 'http://127.0.0.1:3000'
    }
});

io.on('connection', socket => {
    console.log(`A user connected with id: ${socket.id}`);
    socket.on('send-message', (message) => {
        if (message.room === 'public') {
            socket.broadcast.emit('receive-message', message, socket.id);
        } else {
            socket.to(message.room).emit('receive-message', message, socket.id);
        }
        
        console.log(`received message: ${message}`);
    });
    
    socket.on('delivered', (message_id, source) => {
        socket.to(source).emit('mark-seen', message_id); // Notify source the the message was received
    });
});


httpServer.listen(3000, () => {
    console.log('Server now listening on port 3000');
});