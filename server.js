const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Signal = require('./signal');
const pairPrice = require('./model');
const notificationModel = require('./notificationModel');
const personalNotificationModel = require('./personalNotificationModel');
const messageController = require('./controllers/message');
const Message = require('./messageSchema/messageSchema');
const Conversation = require('./messageSchema/conversationSchema');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST"]
  }
});

mongoose.connect(
  "mongodb+srv://new_db:newdb1902@cluster0.9ll3qel.mongodb.net/FX_Signal_Trading",
  { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => {
  console.log('Connected to MongoDB');

  // Set up change streams for real-time updates
  const changeStream = Signal.watch([], { fullDocument: 'updateLookup' });
  const changeStreamPrices = pairPrice.watch([], { fullDocument: 'updateLookup' });
  const changeStreamNotification = notificationModel.watch([], { fullDocument: 'updateLookup' });
  const changeStreamPersonalNotification = personalNotificationModel.watch([], { fullDocument: 'updateLookup' });
  const messageChangeStream = Message.watch([], { fullDocument: 'updateLookup' });
  const conversationChangeStream = Conversation.watch([], { fullDocument: 'updateLookup' });

  changeStream.on('change', (change) => {
    if (change.operationType === 'update' || change.operationType === 'insert') {
      io.emit('documentInserted', change.fullDocument);
    }
  });

  changeStreamPrices.on('change', (change) => {
    if (change.operationType === 'update' || change.operationType === 'insert') {
      io.emit('priceUpdated', change.fullDocument);
    }
  });

  changeStreamNotification.on('change', (change) => {
    if (change.operationType === 'update' || change.operationType === 'insert') {
      io.emit('notificationUpdated', change.fullDocument);
    }
  });

  changeStreamPersonalNotification.on('change', (change) => {
    if (change.operationType === 'update' || change.operationType === 'insert') {
      io.emit('notificationUpdated', change.fullDocument);
    }
  });

  conversationChangeStream.on('change', (change) => {
    if (change.operationType === 'update' || change.operationType === 'insert') {
      io.emit('conversationUpdate', change.fullDocument);
    }
  });

  messageChangeStream.on('change', (change) => {
    // Check for deletion operation
    if (change.operationType === 'delete') {
      const deletedMessageId = change.documentKey._id;
      console.log('Message deleted:', deletedMessageId);
      
      // Emit a messageDeleted event to all connected clients
      // You can also send additional info (like conversationId) if you store it elsewhere.
      io.emit('messageDeleted', { messageId: deletedMessageId });
    }
  });


})
.catch(err => console.error("Database error", err));

// Set up socket connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);


   // When client reconnects, it can request missed messages
   socket.on('syncMessages', async (data) => {
    // Data might include conversationId and lastMessageTimestamp or lastMessageId
    try {
      const { conversationId, lastMessageTimestamp } = data;
      // Query for messages in that conversation newer than lastMessageTimestamp
      const missedMessages = await messageController.find({
        conversation: conversationId,
        createdAt: { $gt: new Date(lastMessageTimestamp) }
      }).sort({ createdAt: 1 });

      // Send the missed messages back to the client
      socket.emit('syncMessagesResponse', missedMessages);
    } catch (error) {
      console.error('Error syncing messages:', error);
      socket.emit('error', { message: 'Could not sync messages.' });
    }
  });

  socket.on('sendMessage', async (data) => {
    console.log("Received sendMessage event:", data);
    try {
      const result = await messageController.createMessageAndConversation(data);
      io.emit('newMessage', result); // Broadcast to all users
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Message could not be sent.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Example route to update a document (for testing via Postman)
app.use(express.json());

// Start the server
server.listen(4000, () => {
  console.log('Server is listening on port 4000');
});
