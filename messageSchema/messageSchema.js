// models/Message.js
const mongoose = require('mongoose');
const deletionMessageMap = require('../middleware/deletionMap');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'registered',
    required: true
  },
  messageId_sender: {
    type: String,
  },
  messageId_receiver: {
    type: String,
  },
  content: {
    type: String,
    required: true
  },
  isRead: {
    type: Number,
    default:0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
