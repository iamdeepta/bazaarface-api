const { gql } = require("apollo-server");

const buyerActivities = gql`
  #   scalar Upload
  scalar DateTime

  type BuyerActivities {
    id: ID
    visitor_id: String!
    visitor: [User]
    user_id: String
    user: [User]
    visitor_user_type: String!
    user_type: String
    product_id: String
    products: [Product]
    quotation_id: String
    quotation: [Quotation]
    bid_id: String
    bid: [Bid]
    ad_id: String
    ad: [Ad]
    post_id: String
    post: [Post]
    text: String
    seen_status: Int
    status: Int
    buyers: [SingleBuyer]
    sellers: [SingleSeller]
    createdAt: DateTime
    message: String
    success: Boolean
  }

  type successInfoBuyerActivities {
    message: String
    success: Boolean
  }

  type User {
    firstname: String
    lastname: String
    company_name: String
    city: String
    country: String
    buyers: [SingleBuyer]
    sellers: [SingleSeller]
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

  type Quotation {
    sender_user_type: String
    receiver_user_type: String
    quantity: String
    price: String
    totalPrice: String
    status: Int
  }

  type Bid {
    sender_user_type: String
    receiver_user_type: String
    color: String
    size: String
    quantity: String
    price: String
    totalPrice: String
    status: Int
  }

  type Ad {
    user_id: String
    user_type: String
    name: String
    description: String
    price: String
    image: [String]
    totalPrice: String
  }

  type Post {
    user_id: String
    user_type: String
    text: String
    image: [String]
  }

  input BuyerActivityInput {
    visitor_id: String
    user_id: String
    visitor_user_type: String
    user_type: String
    product_id: String
    bid_id: String
    quotation_id: String
    ad_id: String
    post_id: String
    text: String
  }

  #   input BuyerActivityUpdateInput {
  #     status: Int
  #     seen_status: Int
  #   }

  type Query {
    getBuyerActivities(
      user_id: ID
      user_type: String
      limit: Int
    ): [BuyerActivities]
    # getQuotationNotifications(
    #   user_id: ID
    #   user_type: String
    #   type: String
    #   limit: Int
    # ): [Notifications]
    getBuyerActivity(id: ID!): BuyerActivities
    # getUnseenNotificationCount(user_id: ID, user_type: String): Int
  }

  type Mutation {
    createBuyerActivity(input: BuyerActivityInput): BuyerActivities
    # seenNotification(id: ID!, input: NotificationUpdateInput): Notifications
    deleteBuyerActivity(id: ID!): successInfoBuyerActivities
    # updateUnseenNotificationCount(user_id: ID, user_type: String): Int
    # acceptQuotation(id: ID!, input: QuotationUpdateInput): Quotations
    # rejectQuotation(id: ID!, input: QuotationUpdateInput): Quotations
  }
`;

module.exports = buyerActivities;
