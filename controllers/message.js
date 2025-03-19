const Conversation = require('../messageSchema/conversationSchema');
const Message = require('../messageSchema/messageSchema');
const User = require('../messageSchema/user'); // Ensure User model is imported

exports.createMessageAndConversation = async ({ messageId, conversationId, sender, recipient, content }) => {
  try {
    // Split conversationId (e.g. "1_caleboruta.co@gmail.com")
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

    // Check for existing conversation between these users
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId], $size: 2 }
    });

    if (!conversation) {
      // No conversation exists yet.
      // Create a new conversation: if the identifier (email part) matches either sender or recipient,
      // set conversationId_sender by default (since both fields are empty).
      let convData = {
        participants: [senderId, recipientId],
        conversationId_sender: null,
        conversationId_receiver: null
      };

      if (identifier === sender || identifier === recipient) {
        convData.conversationId_sender = conversationId;
      }

      conversation = await Conversation.create(convData);
    } else {
      // Conversation already exists.
      // If the identifier (email) matches sender or recipient, update the conversation:
      // - If conversationId_sender is null, set it to conversationId.
      // - Else if conversationId_receiver is null, set that to conversationId.
      let updateData = {};

      if (identifier === sender || identifier === recipient) {
        if (!conversation.conversationId_sender) {
          updateData.conversationId_sender = conversationId;
        } else if (!conversation.conversationId_receiver) {
          updateData.conversationId_receiver = conversationId;
        }
      }

      if (Object.keys(updateData).length > 0) {
        await Conversation.updateOne({ _id: conversation._id }, { $set: updateData });
        conversation = await Conversation.findById(conversation._id);
      }
    }

    // Create the new message.
    // Here we set the message ID into a field depending on the identifier match.
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

    // Save message and update the conversation's lastMessage in parallel.
    const [savedMessage] = await Promise.all([
      message.save(),
      Conversation.updateOne(
        { _id: conversation._id },
        { $set: { lastMessage: message._id } }
      )
    ]);

    // Populate lastMessage and participants
    conversation = await conversation.populate([
      { path: 'lastMessage', select: 'content createdAt' },
      { path: 'participants', select: 'firstname lastname email image_url' }
    ]);

    // Filter out "Admin" users from the participants list
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
