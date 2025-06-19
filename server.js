const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Konfigurasi Socket.IO untuk hosting modern
const io = new Server(server, {
  cors: {
    origin: "*", // Izinkan koneksi dari mana saja
    methods: ["GET", "POST"]
  }
});

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('Seorang pemain terhubung dengan ID:', socket.id);

  socket.on('playerProgress', (data) => {
    socket.broadcast.emit('opponentProgress', {
      id: socket.id,
      progress: data.progress
    });
  });

  socket.on('disconnect', () => {
    console.log('Pemain dengan ID', socket.id, 'terputus');
    io.emit('playerDisconnected', { id: socket.id });
  });
});

// Gunakan port yang disediakan oleh hosting, atau 3000 jika tidak ada
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
