const { model, Schema } = require("mongoose");

const postSchema = new Schema(
  {
    user_id: { type: String, required: true },
    user_type: { type: String, required: true },
    seller_id: { type: String, default: null },
    buyer_id: { type: String, default: null },
    text: { type: String, default: null },
    image: { type: Array, default: [] },
    likes: { type: Array, default: [] },
    // comments: { type: Array, default: [] },
  },
  { timestamps: true }
);

module.exports = model("Post", postSchema);
