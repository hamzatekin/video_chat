const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = require('http').createServer(app);
const options = {
  cors: {
    cors: true,
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
};
const io = require('socket.io')(server, options);
const uuid = require('short-uuid');

app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/gen', (req, res) => {
  res.json({ roomId: uuid.generate() });
});

app.get('/room/:room', (req, res) => {
  const roomId = req.params.room;
});

io.on('connection', (socket) => {
  console.log('socket.id', socket.id);
  socket.emit('me', socket.id);

  socket.on('disconnect', () => {
    socket.broadcast.emit('callEnded');
  });

  socket.on('callUser', ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit('callUser', { signal: signalData, from, name });
  });

  socket.on('answerCall', (data) => {
    io.to(data.to).emit('callAccepted', data.signal);
  });

  socket.on('join-room', ({ roomId, userId }) => {
    socket.join(roomId);
    socket.broadcast.emit('user-connected', userId);
  });
});

const port = process.env.PORT || 3001;
server.listen(port, () => console.log(`Listening on ${port}`));
