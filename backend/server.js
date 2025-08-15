require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./db');
const groupRoutes = require('./routes/groupRoutes');

// 📌 Connexion MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes API
app.use('/api/groups', groupRoutes);

//  Création serveur HTTP + WebSocket
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

//  Gestion Socket.IO
io.on('connection', (socket) => {
    console.log('🟢 Utilisateur connecté :', socket.id);

    // Recevoir un message
    socket.on('sendMessage', (data) => {
        io.to(data.room).emit('receiveMessage', data);
    });

    // Rejoindre un groupe
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(` ${socket.id} a rejoint la salle ${room}`);
    });

    socket.on('disconnect', () => {
        console.log('🔴 Utilisateur déconnecté :', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(` Serveur démarré sur le port ${PORT}`));
