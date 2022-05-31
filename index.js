const { ApolloServer } = require("apollo-server");
const express = require("express");
const app = express();
const gql = require("graphql-tag");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

app.use(cors());
dotenv.config();

const typeDefs = gql`
  type Query {
    sayHi: String!
  }
`;

const resolvers = {
  Query: {
    sayHi: () => "Hello World!!!!!!",
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const port = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true })
  .then(() => {
    console.log("MongoDB connected");
    return server.listen({ port: port });
  })
  .then((res) => {
    console.log(`Server running at ${res.url}`);
  })
  .catch((err) => {
    console.log(err);
  });
