const { model, Schema } = require("mongoose");

const productSchema = new Schema(
  {
    user_id: { type: String, required: true },
    user_type: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    gender: { type: String, required: true },
    colors: { type: Array, default: [] },
    sizes: { type: Array, default: [] },
    manufacturer: { type: String },
    quantity: { type: String, required: true },
    auction_quantity: { type: String },
    marketplace_quantity: { type: String },
    category: { type: String, required: true },
    fabric: { type: String },
    supplier: { type: String },
    gsm: { type: String },
    country: { type: String, required: true },
    price: { type: String, required: true },
    sell_price: { type: String },
    total_auction_price: { type: String },
    total_marketplace_price: { type: String },
    image: { type: Array, default: [] },
    isAuction: { type: Boolean, default: false },
    isMarketplace: { type: Boolean, default: false },
    duration: { type: Number, default: 0 },
    payment: { type: String, default: null },
    highest_bid_price: { type: String, default: "0" },
    postedAtMarket: { type: String, default: null },
    postedAtAuction: { type: String, default: null },
    isNotified: { type: Boolean, default: false },
    // user: {
    //   type: Schema.Types.ObjectId,
    //   ref: "users",
    // },
  },
  { timestamps: true }
);

module.exports = model("Product", productSchema);
