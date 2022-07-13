const { model, Schema } = require("mongoose");

const onboardSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

module.exports = model("Onboard", onboardSchema);
