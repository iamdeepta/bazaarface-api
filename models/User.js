const { model, Schema } = require("mongoose");

const userSchema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String, required: true, default: null },
    token: { type: String, default: null },
    country_code: { type: String, default: null },
    phone: { type: String, required: true },
    company_name: { type: String },
    company_website: { type: String },
    country: { type: String, default: null },
    city: { type: String, default: null },
    isBuyer: { type: Boolean, default: false },
    isSeller: { type: Boolean, default: false },
    user_type: { type: String, default: null },
    profile_image: { type: String, default: null },
    cover_image: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    status: { type: Number, default: 0 },
    //createdAt: String,
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
