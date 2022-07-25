const { model, Schema } = require("mongoose");

const buyerSchema = new Schema(
  {
    user_id: { type: String, required: true },
    email: { type: String, default: null },
    profile_image: { type: String, default: null },
    cover_image: { type: String, default: null },
    designation: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    followers: { type: Array, default: [] },
    following: { type: Array, default: [] },
    total_followers: { type: Number, default: 0 },
    total_following: { type: Number, default: 0 },
    description: { type: String, default: "No description available." },
    user_type: { type: String, default: null },
    work_history: { type: Array, default: [] },
    // uploaded_products: { type: Array, default: [] },
    ads: { type: Array, default: [] },
    notifications: { type: Array, default: [] },
    chats: { type: Array, default: [] },
    reviews: { type: Array, default: [] },
    activity: { type: Array, default: [] },
    sent_quotations: { type: Array, default: [] },
    received_quotations: { type: Array, default: [] },
    status: { type: Number, default: 0 },
    // user: {
    //   type: Schema.Types.ObjectId,
    //   ref: "users",
    // },
  },
  { timestamps: true }
);

module.exports = model("Buyer", buyerSchema);
