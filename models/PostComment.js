const { model, Schema } = require("mongoose");

const postCommentSchema = new Schema(
  {
    post_id: { type: String, required: true },
    sender_id: { type: String, required: true },
    sender_user_type: { type: String, required: true },
    text: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = model("PostComment", postCommentSchema);
