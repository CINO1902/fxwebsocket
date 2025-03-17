const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'registered',
      required: true
    }
  ],
  conversationIdSender: {
    type: Number,
    required: true
  },
  // Optional: a reference to the most recent message for quick access
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, { timestamps: true }); // This will automatically add createdAt and updatedAt

module.exports = mongoose.model('Conversation', conversationSchema);
