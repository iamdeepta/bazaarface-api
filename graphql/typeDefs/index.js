const user = require("./users");
const headerCategory = require("./headerCategories");
const expanse = require("./expanse");
const productCategory = require("./productCategories");
const testimonial = require("./testimonials");
const seller = require("./sellers");

const schemaArray = [
  user,
  headerCategory,
  expanse,
  productCategory,
  testimonial,
  seller,
];

module.exports = schemaArray;
