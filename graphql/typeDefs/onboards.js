const { gql } = require("apollo-server");

const onboards = gql`
  scalar Upload

  type Onboards {
    id: ID!
    title: String!
    description: String!
    image: String
    message: String
    success: Boolean
  }

  type successInfoOnboard {
    message: String
    success: Boolean
  }

  input OnboardInput {
    title: String
    description: String
    file: Upload!
    bucketName: String!
  }

  input OnboardUpdateInput {
    title: String
    description: String
  }

  type Query {
    getOnboards: [Onboards]
    getOnboard(id: ID!): Onboards
  }

  type Mutation {
    createOnboard(input: OnboardInput): Onboards
    updateOnboard(id: ID, input: OnboardUpdateInput): Onboards
    updateOnboardImage(id: ID!, file: Upload!, bucketName: String!): Onboards
    deleteOnboard(id: ID!): successInfoOnboard
  }
`;

module.exports = onboards;
