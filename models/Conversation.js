const { model, Schema } = require("mongoose");

const conversationSchema = new Schema(
  {
    sender_id: { type: String, required: true },
    receiver_id: { type: String, required: true },
    sender_user_type: { type: String },
    receiver_user_type: { type: String },
    status: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = model("Conversation", conversationSchema);
