const { model, Schema } = require("mongoose");

const serviceSchema = new Schema(
  {
    user_id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: null },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "sellers",
    },
  },
  { timestamps: true }
);

module.exports = model("Service", serviceSchema);
