const { model, Schema } = require("mongoose");

const colorSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = model("Color", colorSchema);
