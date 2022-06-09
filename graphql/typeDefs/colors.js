const { gql } = require("apollo-server");

const colors = gql`
  type Colors {
    id: ID!
    name: String!
    code: String!
    message: String
    success: Boolean
  }

  type successInfoColors {
    message: String
    success: Boolean
  }

  input ColorInput {
    name: String
    code: String
  }

  type Query {
    getColors: [Colors]
    getColor(id: ID!): Colors
  }

  type Mutation {
    createColor(input: ColorInput): Colors!
    updateColor(id: ID, input: ColorInput): Colors
    deleteColor(id: ID!): successInfoColors
  }
`;

module.exports = colors;
