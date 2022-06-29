const { model, Schema } = require("mongoose");

const quotationSchema = new Schema(
  {
    sender_id: { type: String, required: true },
    receiver_id: { type: String, required: true },
    product_id: { type: String, required: true },
    sender_user_type: { type: String, default: null },
    receiver_user_type: { type: String, default: null },
    quantity: { type: String, required: true },
    price: { type: String, required: true },
    totalPrice: { type: String, required: true },
    status: { type: Number, default: 0 }, //sent=0, accept=1, reject=2
  },
  { timestamps: true }
);

module.exports = model("Quotation", quotationSchema);
