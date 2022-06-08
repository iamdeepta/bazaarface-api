const { gql } = require("apollo-server");

const headerCategories = gql`
  type HeaderCategories {
    id: ID!
    name: String!
    message: String
    success: Boolean
  }

  type successInfos {
    message: String
    success: Boolean
  }

  input HeaderCategoryInput {
    name: String!
  }

  type Query {
    getHeaderCategories: [HeaderCategories]
    getHeaderCategory(id: ID!): HeaderCategories
  }

  type Mutation {
    createHeaderCategory(input: HeaderCategoryInput): HeaderCategories!
    updateHeaderCategory(id: ID, input: HeaderCategoryInput): HeaderCategories
    deleteHeaderCategory(id: ID!): successInfos
  }
`;

module.exports = headerCategories;
