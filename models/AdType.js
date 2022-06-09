const { model, Schema } = require("mongoose");

const adTypeSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = model("AdType", adTypeSchema);
