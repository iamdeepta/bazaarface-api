const { model, Schema } = require("mongoose");

const sizeSchema = new Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = model("Size", sizeSchema);
