const { model, Schema } = require("mongoose");

const expanseSchema = new Schema(
  {
    countries: { type: String, required: true },
    product_sample: { type: String, required: true },
    companies: { type: String, required: true },
    business_contacts: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = model("Expanse", expanseSchema);
