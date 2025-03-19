import Message from "../models/message.model.js";

class ChatMessage {
  async getMessages(req, res) {
    try {
      const { sender, receiver } = req.query;

      const messages = await Message.find({
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender },
        ],
      }).sort({ createdAt: 1 });

      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: "Error retrieving messages" });
    }
  };

  async sendMessage(req, res) {
    try {
      const { sender, receiver, content } = req.body;

      const message = new Message({ sender, receiver, content });
      await message.save();

      res.status(201).json({ message: "Message send successfully", data: message });
    } catch (error) {
      res.status(500).json({ error: "Error sending message" });
    }
  };

}
export default new ChatMessage;

