const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Signal = require('./signal')

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


mongoose.connect(
    "mongodb+srv://new_db:newdb1902@cluster0.9ll3qel.mongodb.net/FX_Signal_Trading",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log('Connected to MongoDB');
  
    // Start watching the signals collection using the model's change stream
    const changeStream = Signal.watch([], { fullDocument: 'updateLookup' });
  
    changeStream.on('change', (change) => {
      // Handle update operations
      if (change.operationType === 'update') {
        const updatedDoc = change.fullDocument;
        console.log('Document updated:', updatedDoc);
        io.emit('documentInserted', updatedDoc);
      }
      // Handle insert operations
      else if (change.operationType === 'insert') {
        const insertedDoc = change.fullDocument;
        console.log('Document inserted:', insertedDoc);
        io.emit('documentInserted', insertedDoc);
      }
    });
  })
  .catch(err => console.error("Database error", err));
  

// Example route to update a document (for testing via Postman)
app.use(express.json());

// Start the server
server.listen(4000, () => {
  console.log('Server is listening on port 3000');
});
