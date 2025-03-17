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
  messageId: {
    type: Number,
    required: true
  },
  conversationId: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
