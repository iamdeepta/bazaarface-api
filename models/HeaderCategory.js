const { model, Schema } = require("mongoose");

const headerCategorySchema = new Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = model("HeaderCategory", headerCategorySchema);
