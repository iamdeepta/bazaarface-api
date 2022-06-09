const { model, Schema } = require("mongoose");

const adSchema = new Schema(
  {
    user_id: { type: String, required: true },
    user_type: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    quantity: { type: String, required: true },
    category: { type: String, required: true },
    country: { type: String, required: true },
    price: { type: String, required: true },
    type: { type: String, required: true },
    ad_for: { type: String, required: true },
    image: { type: Array, default: [] },
    // user: {
    //   type: Schema.Types.ObjectId,
    //   ref: "users",
    // },
  },
  { timestamps: true }
);

module.exports = model("Ad", adSchema);
