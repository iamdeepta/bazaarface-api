const { gql } = require("apollo-server");

const adTypes = gql`
  type AdTypes {
    id: ID!
    name: String!
    price: Int!
    message: String
    success: Boolean
  }

  type successInfoAdTypes {
    message: String
    success: Boolean
  }

  input AdTypeInput {
    name: String
    price: Int
  }

  type Query {
    getAdTypes: [AdTypes]
    getAdType(id: ID!): AdTypes
  }

  type Mutation {
    createAdType(input: AdTypeInput): AdTypes!
    updateAdType(id: ID, input: AdTypeInput): AdTypes
    deleteAdType(id: ID!): successInfoAdTypes
  }
`;

module.exports = adTypes;
