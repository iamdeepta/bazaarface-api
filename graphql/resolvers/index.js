const usersResolvers = require("./users");
const headerCategoriesResolvers = require("./headerCategories");
const expanseResolvers = require("./expanse");
const productCategoriesResolvers = require("./productCategories");
const testimonialsResolvers = require("./testimonials");
const sellersResolvers = require("./sellers");
const countriesResolvers = require("./countries");
const servicesResolvers = require("./services");
const locationsResolvers = require("./locations");
const colorsResolvers = require("./colors");
const sizesResolvers = require("./sizes");
const adTypesResolvers = require("./adTypes");
const productsResolvers = require("./products");
const adsResolvers = require("./ads");
const buyersResolvers = require("./buyers");
const quotationsResolvers = require("./quotations");
const messagesResolvers = require("./messages");
const bidsResolvers = require("./bids");
const notificationsResolvers = require("./notifications");
const postsResolvers = require("./posts");
const postCommentsResolvers = require("./postComments");
const onboardsResolvers = require("./onboards");
const buyerActivitiesResolvers = require("./buyerActivities");
const announcementsResolvers = require("./announcements");

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
    ...countriesResolvers.Query,
    ...servicesResolvers.Query,
    ...locationsResolvers.Query,
    ...colorsResolvers.Query,
    ...sizesResolvers.Query,
    ...adTypesResolvers.Query,
    ...productsResolvers.Query,
    ...adsResolvers.Query,
    ...buyersResolvers.Query,
    ...quotationsResolvers.Query,
    ...messagesResolvers.Query,
    ...bidsResolvers.Query,
    ...notificationsResolvers.Query,
    ...postsResolvers.Query,
    ...postCommentsResolvers.Query,
    ...onboardsResolvers.Query,
    ...buyerActivitiesResolvers.Query,
    ...announcementsResolvers.Query,
  },
  Upload: GraphQLUpload,
  Mutation: {
    ...usersResolvers.Mutation,
    ...headerCategoriesResolvers.Mutation,
    ...expanseResolvers.Mutation,
    ...productCategoriesResolvers.Mutation,
    ...testimonialsResolvers.Mutation,
    ...sellersResolvers.Mutation,
    ...countriesResolvers.Mutation,
    ...servicesResolvers.Mutation,
    ...locationsResolvers.Mutation,
    ...colorsResolvers.Mutation,
    ...sizesResolvers.Mutation,
    ...adTypesResolvers.Mutation,
    ...productsResolvers.Mutation,
    ...adsResolvers.Mutation,
    ...buyersResolvers.Mutation,
    ...quotationsResolvers.Mutation,
    ...messagesResolvers.Mutation,
    ...bidsResolvers.Mutation,
    ...notificationsResolvers.Mutation,
    ...postsResolvers.Mutation,
    ...postCommentsResolvers.Mutation,
    ...onboardsResolvers.Mutation,
    ...buyerActivitiesResolvers.Mutation,
    ...announcementsResolvers.Mutation,
  },

  Subscription: {
    ...messagesResolvers.Subscription,
    ...bidsResolvers.Subscription,
    ...postCommentsResolvers.Subscription,
  },
};
