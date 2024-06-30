import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Server as SocketIOServer } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.use(express.static(path.join(__dirname, 'public')));

const io = new SocketIOServer(server);

let socketsConnected = new Set();

io.on('connection', onConnection);

function onConnection(socket) {
  console.log(`Client connected: ${socket.id}`);
  socketsConnected.add(socket);

  io.emit('clients-total', socketsConnected.size);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    socketsConnected.delete(socket);

    io.emit('clients-total', socketsConnected.size);
  });

  socket.on('message', (data) => {
    console.log(data)
    socket.broadcast.emit('chat-message', data);
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);
  });
}
