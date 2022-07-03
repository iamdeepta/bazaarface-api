const { gql } = require("apollo-server");

const bids = gql`
  #   scalar Upload

  type Bids {
    id: ID!
    sender_id: String!
    sender: [User]
    receiver_id: String!
    receiver: [User]
    sender_user_type: String!
    receiver_user_type: String!
    product_id: String!
    products: [Product]
    color: String
    size: String
    quantity: String
    price: String
    totalPrice: String
    status: Int
    buyers: [SingleBuyer]
    sellers: [SingleSeller]
    message: String
    success: Boolean
  }

  type successInfoQuotations {
    message: String
    success: Boolean
  }

  type User {
    firstname: String
    lastname: String
    company_name: String
    city: String
    country: String
  }

  type SingleSeller {
    profile_image: String
    description: String
    total_followers: Int
  }

  type SingleBuyer {
    profile_image: String
  }

  type Product {
    name: String
    image: [String]
    fabric: String
    price: String
    quantity: String
    auction_quantity: String
    marketplace_quantity: String
    isAuction: Boolean
    isMarketplace: Boolean
  }

  input BidInput {
    sender_id: String!
    receiver_id: String!
    sender_user_type: String
    receiver_user_type: String
    conversation_id: String
    text: String
    product_id: String
    color: String
    size: String
    quantity: String
    price: String
    totalPrice: String
  }

  input BidUpdateInput {
    status: Int
  }

  type Query {
    getBids(receiver_id: ID, limit: Int): [Bids]
    getSingleBid(id: ID!): Bids
  }

  type Mutation {
    createBid(input: BidInput): Bids
    acceptBid(id: ID!, input: BidUpdateInput): Bids
    rejectBid(id: ID!, input: BidUpdateInput): Bids
  }

  type Subscription {
    newBid: Bids
  }
`;

module.exports = bids;
