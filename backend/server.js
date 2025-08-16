require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./db');

const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (_, res) => res.send('API OK'));
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);

const server = http.createServer(app);
require('./socket')(server);

// Init FCM admin (option)
if (process.env.FIREBASE_ADMIN_CREDENTIALS_PATH) {
  const admin = require('firebase-admin');
  admin.initializeApp({
    credential: admin.credential.cert(require(process.env.FIREBASE_ADMIN_CREDENTIALS_PATH))
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 API+WS sur ${PORT}`));
