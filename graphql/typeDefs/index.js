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
];

module.exports = schemaArray;
