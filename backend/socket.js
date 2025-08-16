const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Group = require('./models/groupModel');
const Message = require('./models/messageModel');
const User = require('./models/userModel');

// Option FCM
let admin = null;
try { admin = require('firebase-admin'); } catch (_) {}
const sendPush = async (userIds, title, body) => {
  if (!admin) return;
  const users = await User.find({ _id: { $in: userIds } }, 'deviceTokens');
  const tokens = users.flatMap(u => u.deviceTokens || []);
  if (!tokens.length) return;
  await admin.messaging().sendEachForMulticast({ tokens, notification: { title, body } });
};

module.exports = function attachSocket(server) {
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('no token'));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: payload.id, email: payload.email };
      socket.join(`user:${payload.id}`); // salle perso pour notifs ciblées
      next();
    } catch {
      next(new Error('bad token'));
    }
  });

  io.on('connection', (socket) => {
    // Rejoindre un groupe (salle)
    socket.on('joinRoom', async ({ groupId }) => {
      socket.join(`group:${groupId}`);
    });

    // Envoyer un message
    socket.on('sendMessage', async ({ groupId, text }) => {
      if (!groupId || !text) return;
      const msg = await Message.create({
        group: groupId,
        sender: socket.user.id,
        text
      });

      const populated = await Message.findById(msg._id).populate('sender', 'name');

      // Diffusion aux membres du groupe
      io.to(`group:${groupId}`).emit('receiveMessage', {
        _id: populated._id,
        groupId,
        text: populated.text,
        sender: { id: populated.sender._id, name: populated.sender.name },
        createdAt: populated.createdAt
      });

      // Notif visuelle (toast) côté clients: event séparé
      io.to(`group:${groupId}`).emit('messageNotification', {
        groupId,
        title: populated.sender.name,
        body: populated.text
      });

      // Push FCM (option) aux membres non connectés
      const grp = await Group.findById(groupId);
      const others = grp.members.map(String).filter(id => id !== socket.user.id);
      await sendPush(others, populated.sender.name, populated.text);
    });
  });

  return io;
};
