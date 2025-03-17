const Conversation = require('../messageSchema/conversationSchema');

exports.startConversation = async (participantIds) => {
  // Ensure exactly two participants are provided.
  if (participantIds.length !== 2) {
    throw new Error("A conversation must include exactly two participants.");
  }

  // Check if a conversation between these two already exists.
  // Using $all ensures both IDs are in the participants array.
  // $size enforces that there are exactly two participants.
  const existingConversation = await Conversation.findOne({
    participants: { $all: participantIds, $size: 2 }
  });

  if (existingConversation) {
    return existingConversation;
  }

  // If no conversation exists, create a new one.
  const newConversation = new Conversation({
    participants: participantIds
  });

  return await newConversation.save();
};
