const usersResolvers = require("./users");
//const commentsResolvers = require("./comments");
// const ImageResolver = require("./image_resolvers");
const {
  GraphQLUpload,
  graphqlUploadExpress, // A Koa implementation is also exported.
} = require("graphql-upload");

module.exports = {
  Query: {
    ...usersResolvers.Query,
  },
  Upload: GraphQLUpload,
  Mutation: {
    ...usersResolvers.Mutation,
  },
};
