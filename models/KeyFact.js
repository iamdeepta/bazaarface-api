const { model, Schema } = require("mongoose");

const keyFactSchema = new Schema(
  {
    seller_id: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    founded: { type: String, default: 0 },
    employees: { type: String, default: 0 },
    revenue: { type: String, default: 0 },
    production: { type: String, default: 0 },
    machinery: { type: String, default: 0 },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "sellers",
    },
  },
  { timestamps: true }
);

module.exports = model("KeyFact", keyFactSchema);
