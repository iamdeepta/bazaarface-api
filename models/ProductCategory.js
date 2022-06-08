const { model, Schema } = require("mongoose");

const productCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

module.exports = model("ProductCategory", productCategorySchema);
