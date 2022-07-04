const { model, Schema } = require("mongoose");

const notificationSchema = new Schema(
  {
    type: { type: String, required: true },
    visitor_id: { type: String, default: null },
    visitor_user_type: { type: String },
    quotation_id: { type: String, default: null },
    user_id: { type: String, required: true },
    user_type: { type: String },
    product_id: { type: String, default: null },
    bid_id: { type: String, default: null },
    text: { type: String, required: true },
    seen_status: { type: Number, default: 0 },
    status: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = model("Notification", notificationSchema);
