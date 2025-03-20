const Conversation = require('../messageSchema/conversationSchema');
const Message = require('../messageSchema/messageSchema');
const User = require('../messageSchema/user'); // Ensure User model is imported
const mongoose = require('mongoose');


exports.createMessageAndConversation = async ({ messageId, conversationId, sender, recipient, content }) => {
  try {
    // Extract identifier from conversationId (e.g. "1_caleboruta.co@gmail.com")
    const conversationIdParts = conversationId.split('_');
    const identifier = conversationIdParts.length > 1 ? conversationIdParts[1] : '';

    // Fetch sender and recipient IDs concurrently
    const [senderUser, recipientUser] = await Promise.all([
      User.findOne({ email: sender }).select('_id'),
      User.findOne({ email: recipient }).select('_id')
    ]);

    if (!senderUser || !recipientUser) {
      throw new Error('Sender or recipient not found');
    }

    const senderId = senderUser._id;
    const recipientId = recipientUser._id;

    // Find existing conversation between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId], $size: 2 }
    });

    let updateData = {};

    if (!conversation) {
      // No conversation exists, create a new one
      conversation = await Conversation.create({
        participants: [senderId, recipientId],
        conversationId_sender: identifier === sender ? conversationId : null,
        conversationId_receiver: identifier === recipient ? conversationId : null
      });
    } else {
      // Check if conversationId_sender or conversationId_receiver is empty
      if (!conversation.conversationId_sender) {
        updateData.conversationId_sender = conversationId;
      } else if (!conversation.conversationId_receiver) {
        updateData.conversationId_receiver = conversationId;
      } else {
        // Both are not null, check if we need to replace one
        if (conversation.conversationId_sender.split('_')[1] === identifier) {
          updateData.conversationId_sender = conversationId;
        } else if (conversation.conversationId_receiver.split('_')[1] === identifier) {
          updateData.conversationId_receiver = conversationId;
        }
      }

      // Apply the update if needed
      if (Object.keys(updateData).length > 0) {
        await Conversation.updateOne({ _id: conversation._id }, { $set: updateData });
        conversation = await Conversation.findById(conversation._id);
      }
    }

    // Create the new message
    let messageData = {
      conversation: conversation._id,
      sender: senderId,
      content: content,
    };

    if (identifier === sender) {
      messageData.messageId_sender = messageId;
    } else if (identifier === recipient) {
      messageData.messageId_receiver = messageId;
    }

    const message = new Message(messageData);

    // Save the message and update the lastMessage field in parallel
    const [savedMessage] = await Promise.all([
      message.save(),
      Conversation.updateOne(
        { _id: conversation._id },
        { $set: { lastMessage: message._id } }
      )
    ]);

    // Populate last message and participants
    conversation = await conversation.populate([
      { path: 'lastMessage', select: 'content createdAt' },
      { path: 'participants', select: 'firstname lastname email image_url' }
    ]);

    // Filter out "Admin" users from the participant list
    const filteredConversation = {
      ...conversation.toObject(),
      participants: conversation.participants.filter(user => user.firstname !== "Admin")
    };

    return { conversations: filteredConversation, message: savedMessage };
  } catch (error) {
    console.error('Error creating message and conversation:', error);
    throw error;
  }
};


exports.updateMessage = async ({ messageId }) => {
  try {
    const objectId = new mongoose.Types.ObjectId(messageId);
    console.log(objectId);

    // Update the message if needed
    await Message.updateOne({ _id: objectId }, { $set: { isRead: 1 } });

    // Fetch the updated message
    const messagefind = await Message.findOne({ _id: objectId });

    return { message: messagefind };
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
};