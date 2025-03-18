const Conversation = require('../messageSchema/conversationSchema');
const Message = require('../messageSchema/messageSchema');
const User = require('../messageSchema/user'); // Ensure User model is imported

exports.createMessageAndConversation = async ({ messageId, conversationId, sender, recipient, content }) => {
  try {
    const conversationIdParts = conversationId.split('_');
    const identifier = conversationIdParts.length > 1 ? conversationIdParts[1] : '';

    // Find sender and recipient concurrently
    const [senderUser, recipientUser] = await Promise.all([
      User.findOne({ email: sender }).select('_id'),
      User.findOne({ email: recipient }).select('_id')
    ]);

    if (!senderUser || !recipientUser) {
      throw new Error('Sender or recipient not found');
    }

    const senderId = senderUser._id;
    const recipientId = recipientUser._id;

    let conversationId_sender = identifier === sender ? conversationId : null;
    let conversationId_receiver = identifier === recipient ? conversationId : null;

    let messageId_sender = identifier === sender ? messageId : null;
    let messageId_receiver = identifier === recipient ? messageId : null;

    // Check for existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId], $size: 2 }
    });

    // If no conversation exists, create one
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId], 
        conversationId_sender,
        conversationId_receiver
      });
    }

    // Create the new message and save it
    const message = new Message({
      conversation: conversation._id,
      sender: senderId,
      messageId_sender,
      messageId_receiver,
      content
    });

    // Save message and update conversation in parallel
    const [savedMessage] = await Promise.all([
      message.save(),
      Conversation.updateOne(
        { _id: conversation._id },
        { $set: { lastMessage: message._id } }
      )
    ]);

    // Populate last message and participants asynchronously
    conversation = await conversation.populate([
      { path: 'lastMessage', select: 'content createdAt' },
      { path: 'participants', select: 'firstname lastname email image_url' }
    ]);

    // Filter out "Admin" users
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
