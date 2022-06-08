const usersResolvers = require("./users");
const headerCategoriesResolvers = require("./headerCategories");
const expanseResolvers = require("./expanse");
const productCategoriesResolvers = require("./productCategories");
const testimonialsResolvers = require("./testimonials");
const sellersResolvers = require("./sellers");

const {
  GraphQLUpload,
  graphqlUploadExpress, // A Koa implementation is also exported.
} = require("graphql-upload");

module.exports = {
  Query: {
    ...usersResolvers.Query,
    ...headerCategoriesResolvers.Query,
    ...expanseResolvers.Query,
    ...productCategoriesResolvers.Query,
    ...testimonialsResolvers.Query,
    ...sellersResolvers.Query,
  },
  Upload: GraphQLUpload,
  Mutation: {
    ...usersResolvers.Mutation,
    ...headerCategoriesResolvers.Mutation,
    ...expanseResolvers.Mutation,
    ...productCategoriesResolvers.Mutation,
    ...testimonialsResolvers.Mutation,
    ...sellersResolvers.Mutation,
  },
};
