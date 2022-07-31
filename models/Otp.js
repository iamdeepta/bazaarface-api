const { model, Schema } = require("mongoose");

const otpSchema = new Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = model("Otp", otpSchema);
