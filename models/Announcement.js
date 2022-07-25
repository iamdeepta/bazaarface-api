const { model, Schema } = require("mongoose");

const announcementSchema = new Schema(
  {
    title: { type: String, required: true },
    semi_title: { type: String },
    description: { type: String },
    link: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

module.exports = model("Announcement", announcementSchema);
