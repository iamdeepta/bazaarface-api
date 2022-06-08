const { model, Schema } = require("mongoose");

const locationSchema = new Schema(
  {
    user_id: { type: String, required: true },
    office: { type: String },
    address: { type: String },
    open_day1: { type: String },
    open_day2: { type: String },
    open_time1: { type: String },
    open_time2: { type: String },
    map: { type: String },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "sellers",
    },
  },
  { timestamps: true }
);

module.exports = model("Location", locationSchema);
