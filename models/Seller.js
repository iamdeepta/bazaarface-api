const { model, Schema } = require("mongoose");

const sellerSchema = new Schema(
  {
    user_id: { type: String, required: true },
    email: { type: String, unique: true },
    profile_image: { type: String, default: null },
    cover_image: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    followers: { type: Array, default: [] },
    following: { type: Array, default: [] },
    total_followers: { type: Number, default: 0 },
    total_following: { type: Number, default: 0 },
    description: { type: String, default: null },
    user_type: { type: String, default: null },
    key_facts: {
      type: Object,
      default: {
        user_id: String,
        founded: "0",
        employees: "0",
        revenue: "0",
        production: "0",
        machinery: "0",
      },
    },
    ref_customers: { type: Array, default: [] },
    uploaded_products: { type: Array, default: [] },
    services: { type: Array, default: [] },
    locations: { type: Array, default: [] },
    ads: { type: Array, default: [] },
    notifications: { type: Array, default: [] },
    chats: { type: Array, default: [] },
    sent_quotations: { type: Array, default: [] },
    received_quotations: { type: Array, default: [] },
    status: { type: Number, default: 0 },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

module.exports = model("Seller", sellerSchema);
