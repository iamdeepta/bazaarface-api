const { ApolloServer } = require("apollo-server-express");
const { PubSub } = require("graphql-subscriptions");
const express = require("express");
const app = express();
const gql = require("graphql-tag");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const {
  graphqlUploadExpress, // A Koa implementation is also exported.
} = require("graphql-upload");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

app.use(cors());
dotenv.config();

async function startServer() {
  const pubsub = new PubSub();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub }),
  });

  await server.start();

  // This middleware should be added before calling `applyMiddleware`.
  app.use(graphqlUploadExpress());

  server.applyMiddleware({ app });

  const port = process.env.PORT || 8000;

  await mongoose
    .connect(process.env.MONGO_URL, { useNewUrlParser: true })
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((err) => {
      console.log(err);
    });

  await new Promise((r) => app.listen({ port: 8000 }, r));

  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
}

startServer();
