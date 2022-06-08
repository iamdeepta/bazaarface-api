const user = require("./users");
const headerCategory = require("./headerCategories");
const expanse = require("./expanse");
const productCategory = require("./productCategories");
const testimonial = require("./testimonials");
const seller = require("./sellers");
const country = require("./countries");
const location = require("./locations");

const schemaArray = [
  user,
  headerCategory,
  expanse,
  productCategory,
  testimonial,
  seller,
  country,
  location,
];

module.exports = schemaArray;
