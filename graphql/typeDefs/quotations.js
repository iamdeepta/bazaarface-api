const { gql } = require("apollo-server");

const quotations = gql`
  #   scalar Upload

  type Quotations {
    id: ID!
    sender_id: String!
    sender: [User]
    receiver_id: String!
    receiver: [User]
    sender_user_type: String!
    receiver_user_type: String!
    product_id: String!
    products: [Product]
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

  input QuotationInput {
    sender_id: String!
    receiver_id: String!
    sender_user_type: String
    receiver_user_type: String
    product_id: String
    quantity: String
    price: String
    totalPrice: String
  }

  input QuotationUpdateInput {
    status: Int
  }

  type Query {
    getReceivedQuotations(receiver_id: ID, limit: Int): [Quotations]
    getReceivedQuotationModal(id: ID!): Quotations
    getSentQuotations(sender_id: ID, limit: Int): [Quotations]
    getSentQuotationModal(id: ID!): Quotations
    # getReceivedQuotationViewModal(id: ID!, user_id: ID!): Quotations
  }

  type Mutation {
    createQuotation(input: QuotationInput): Quotations
    acceptQuotation(id: ID!): Quotations
    rejectQuotation(id: ID!): Quotations
  }
`;

module.exports = quotations;
