const usersResolvers = require("./users");
//const commentsResolvers = require("./comments");

module.exports = {
  Query: {
    ...usersResolvers.Query,
  },
  Mutation: {
    ...usersResolvers.Mutation,
  },
};
