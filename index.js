const app = require('express')();
const server = require('http').createServer(app);
const cors = require('cors');

const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

var socketArray = [];

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res)=>{
    res.send('Server is running');
});

io.on('connection', (socket) => {
    socketArray.push(socket.id);
    socket.on('whatDoYouWant', ()=>{
        io.to(socket.id).emit('gimmeYourDetails', socket.id);
    })

    socket.on('disconnect', () => {
        socket.broadcast.emit('callended');
        console.log('disconnected', socket.id);
        socketArray.pop(socket.id);
        console.log(socketArray);
    });

    socket.on('calluser', ({userToCall, signalData, from, name}) => {
        io.to(userToCall).emit('calluser', {signal: signalData, from, name});
    })

    socket.on('answercall', (data) => {
        io.to(data.to).emit('callaccepted', data.signal);
    })
});

server.listen(PORT, ()=>{console.log(`Server listening on port: ${PORT}`)})