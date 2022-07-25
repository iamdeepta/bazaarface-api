const user = require("./users");
const headerCategory = require("./headerCategories");
const expanse = require("./expanse");
const productCategory = require("./productCategories");
const testimonial = require("./testimonials");
const seller = require("./sellers");
const country = require("./countries");
const location = require("./locations");
const color = require("./colors");
const size = require("./sizes");
const adType = require("./adTypes");
const product = require("./products");
const ad = require("./ads");
const buyer = require("./buyers");
const quotation = require("./quotations");
const message = require("./messages");
const bid = require("./bids");
const notification = require("./notifications");
const post = require("./posts");
const postComment = require("./postComments");
const onboard = require("./onboards");
const buyerActivity = require("./buyerActivities");
const announcement = require("./announcements");

const schemaArray = [
  user,
  headerCategory,
  expanse,
  productCategory,
  testimonial,
  seller,
  country,
  location,
  color,
  size,
  adType,
  product,
  ad,
  buyer,
  quotation,
  message,
  bid,
  notification,
  post,
  postComment,
  onboard,
  buyerActivity,
  announcement,
];

module.exports = schemaArray;
