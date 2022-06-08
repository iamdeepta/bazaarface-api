const { model, Schema } = require("mongoose");

const countrySchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = model("Country", countrySchema);
