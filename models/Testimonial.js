const { model, Schema } = require("mongoose");

const testimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    designation: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

module.exports = model("Testimonial", testimonialSchema);
