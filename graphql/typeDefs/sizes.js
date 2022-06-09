const { gql } = require("apollo-server");

const sizes = gql`
  type Sizes {
    id: ID!
    name: String!
    message: String
    success: Boolean
  }

  type successInfoSizes {
    message: String
    success: Boolean
  }

  input SizeInput {
    name: String
  }

  type Query {
    getSizes: [Sizes]
    getSize(id: ID!): Sizes
  }

  type Mutation {
    createSize(input: SizeInput): Sizes!
    updateSize(id: ID, input: SizeInput): Sizes
    deleteSize(id: ID!): successInfoSizes
  }
`;

module.exports = sizes;
