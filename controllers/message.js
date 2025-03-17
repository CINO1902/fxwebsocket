const Conversation = require('../messageSchema/conversationSchema');
const Message = require('../messageSchema/messageSchema');
const User = require('../messageSchema/user'); // Ensure User model is imported

exports.createMessageAndConversation = async ({ messageId, conversationId, sender, recipient, content }) => {
  try {
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

    // Look for an existing conversation between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId], $size: 2 }
    });

    // If no conversation exists, create one automatically
    if (!conversation) {
      conversation = new Conversation({ 
        participants: [senderId, recipientId], 
        conversationId: conversationId 
      });
      await conversation.save();
    }

    // Ensure participants are populated
    await conversation.populate('participants', 'firstname lastname email image_url');

    // Create the new message referencing the conversation ID
    const message = new Message({
      conversation: conversation._id,
      sender: senderId,
      messageId: messageId,
      conversationId: conversationId,
      content: content
    });
    const savedMessage = await message.save();

    // Update the conversation's last message field and save
    conversation.lastMessage = savedMessage._id;
    await conversation.save();

    // Populate lastMessage and re-populate participants (if needed)
    await conversation.populate('lastMessage', 'content createdAt');
    await conversation.populate('participants', 'firstname lastname email image_url');

    // Filter out participants with firstname "Admin"
    const filteredConversation = {
      ...conversation.toObject(),
      participants: conversation.participants.filter(user => user.firstname !== "Admin")
    };

    console.log(savedMessage);
    return { conversations: filteredConversation, message: savedMessage };
  } catch (error) {
    console.error('Error creating message and conversation:', error);
    throw error;
  }
};

