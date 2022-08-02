const { gql } = require("apollo-server");

const sellers = gql`
  scalar Upload

  type Sellers {
    id: ID!
    user_id: String!
    description: String
    profile_image: String
    cover_image: String
    key_facts: KeyFacts
    ref_customers: [String]
    services: [Services]
    followers: [String]
    following: [String]
    total_followers: Int
    total_following: Int
    message: String
    success: Boolean
  }

  type KeyFacts {
    email: String
    founded: String
    employees: String
    revenue: String
    production: String
    machinery: String
    message: String
    success: Boolean
  }

  type Services {
    id: ID!
    name: String
    description: String
    image: String
    message: String
    success: Boolean
  }

  type SellersFollowersList {
    name: String
    profile_image: String
  }

  type successInfoSeller {
    message: String
    success: Boolean
  }

  input SellerDesInput {
    description: String
  }
  input SellerKeyFactInput {
    founded: String
    employees: String
    revenue: String
    production: String
    machinery: String
  }

  input SellerServiceInput {
    name: String
    description: String
    file: Upload!
    bucketName: String!
  }

  input SellerServiceUpdateInput {
    name: String
    description: String
  }

  type Query {
    getSellers: [Sellers]
    getSeller(id: ID!): Sellers
    getSellerServices: [Services]
    getSellerService(user_id: ID!): [Services]
    getSellerFollowersList(id: ID!): [SellersFollowersList]
    getTotalSeller: Int
  }

  type Mutation {
    updateSellerDescription(id: ID!, input: SellerDesInput): Sellers
    updateKeyFact(id: ID!, input: SellerKeyFactInput): KeyFacts
    uploadSellerProPic(id: ID!, file: Upload!, bucketName: String!): Sellers
    uploadSellerCoverPic(id: ID!, file: Upload!, bucketName: String!): Sellers
    uploadSellerRefCustomersImage(
      id: ID!
      files: [Upload!]!
      bucketName: String!
    ): [successInfoSeller]
    updateSellerRefCustomersImage(
      id: ID!
      pic_name: String!
      file: Upload!
      bucketName: String!
    ): successInfoSeller
    deleteSellerRefCustomersImage(
      id: ID!
      pic_name: String!
      bucketName: String!
    ): successInfoSeller

    createSellerService(user_id: ID!, input: SellerServiceInput): Services
    updateSellerService(id: ID, input: SellerServiceUpdateInput): Services
    updateSellerServiceImage(
      id: ID!
      file: Upload!
      bucketName: String!
    ): Services
    deleteSellerService(
      id: ID!
      pic_name: String!
      bucketName: String!
    ): successInfoSeller

    updateSellerFollowers(id: ID!, follow_id: ID!, user_id: ID!): Sellers
    updateSellerUnfollow(id: ID!, follow_id: ID!, user_id: ID!): Sellers

    addFollowers(
      user_id: String
      user_type: String
      receiver_id: String
      receiver_user_type: String
    ): successInfoSeller
  }
`;

module.exports = sellers;
