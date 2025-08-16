const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String },
  // (option) pièces jointes, images, etc.
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
