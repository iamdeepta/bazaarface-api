const { gql } = require("apollo-server");

const buyers = gql`
  scalar Upload

  type Buyers {
    id: ID!
    user_id: String!
    designation: String
    description: String
    profile_image: String
    cover_image: String
    user_type: String
    work_history: [WorkHistory]
    followers: [String]
    following: [String]
    total_followers: Int
    total_following: Int
    users: [Users]
    country: String
    message: String
    success: Boolean
  }

  type Users {
    firstname: String
    lastname: String
    country: String
    city: String
    profile_image: String
    cover_image: String
  }

  type WorkHistory {
    id: String
    designation: String
    location: String
    year_range: String
    message: String
    success: Boolean
  }

  type BuyersFollowersList {
    name: String
    profile_image: String
  }

  type successInfoBuyer {
    message: String
    success: Boolean
  }

  input BuyerDesInput {
    description: String
    firstname: String
    lastname: String
    designation: String
    country: String
  }

  input BuyerWorkHistoryInput {
    work_history_id: String
    designation: String
    location: String
    year_range: String
  }

  type Query {
    getBuyers: [Buyers]
    getBuyer(id: ID!): Buyers
    getWorkHistory(id: ID!, work_history_id: String): WorkHistory
    getBuyerFollowersList(id: ID!): [BuyersFollowersList]
    getTotalBuyer: Int
  }

  type Mutation {
    updateBuyerDescription(id: ID!, input: BuyerDesInput): Buyers
    uploadBuyerProPic(id: ID!, file: Upload!, bucketName: String!): Buyers
    uploadBuyerCoverPic(id: ID!, file: Upload!, bucketName: String!): Buyers
    createWorkHistory(id: ID!, input: BuyerWorkHistoryInput): WorkHistory
    updateWorkHistory(id: ID!, input: BuyerWorkHistoryInput): WorkHistory
    deleteWorkHistory(id: ID!, work_history_id: String): WorkHistory

    updateBuyerFollowers(id: ID!, follow_id: ID!, user_id: ID!): Buyers
    updateBuyerUnfollow(id: ID!, follow_id: ID!, user_id: ID!): Buyers
  }
`;

module.exports = buyers;
