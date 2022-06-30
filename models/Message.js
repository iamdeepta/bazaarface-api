const { model, Schema } = require("mongoose");

const messageSchema = new Schema(
  {
    conversation_id: { type: String, required: true },
    sender_id: { type: String, required: true },
    sender_user_type: { type: String },
    text: { type: String, required: true },
    image: { type: String, default: null },
    status: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = model("Message", messageSchema);
