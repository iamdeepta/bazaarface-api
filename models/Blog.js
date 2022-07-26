const { model, Schema } = require("mongoose");

const blogSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },
    time: { type: String, required: true },
    image: { type: Array, default: [] },
    likes: { type: Array, default: [] },
    // comments: { type: Array, default: [] },
  },
  { timestamps: true }
);

module.exports = model("Blog", blogSchema);
