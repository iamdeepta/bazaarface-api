const { model, Schema } = require("mongoose");

const blogCommentSchema = new Schema(
  {
    blog_id: { type: String, required: true },
    sender_id: { type: String, required: true },
    sender_user_type: { type: String, required: true },
    text: { type: String, required: true },
    status: { type: Number, default: 0 }, //status if comment is approved or not-- approved: 1
  },
  { timestamps: true }
);

module.exports = model("BlogComment", blogCommentSchema);
