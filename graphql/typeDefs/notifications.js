const { gql } = require("apollo-server");

const notifications = gql`
  #   scalar Upload
  scalar DateTime

  type Notifications {
    id: ID!
    visitor_id: String
    visitor: [User]
    user_id: String!
    user: [User]
    visitor_user_type: String
    user_type: String
    product_id: String
    products: [Product]
    ad_id: String
    ads: [Ad]
    blog_id: String
    blogs: [SingleBlog]
    quotation_id: String
    quotation: [Quotation]
    bid_id: String
    bid: [Bid]
    text: String!
    type: String
    seen_status: Int
    status: Int
    buyers: [SingleBuyer]
    sellers: [SingleSeller]
    createdAt: DateTime
    message: String
    success: Boolean
  }

  type successInfoNotifications {
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

  type Ad {
    name: String
    image: [String]
    description: String
    phone: String
    location: String
    price: String
    quantity: String
    ad_for: String
    type: String
  }

  type SingleBlog {
    title: String
    description: String
    category: String
    time: String
    image: [String]
  }

  type Quotation {
    sender_user_type: String
    receiver_user_type: String
    quantity: String
    price: String
    totalPrice: String
    status: Int
    isAd: Boolean
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

  input NotificationInput {
    visitor_id: String
    user_id: String
    visitor_user_type: String
    user_type: String
    product_id: String
    quotation_id: String
    text: String
  }

  input NotificationUpdateInput {
    status: Int
    seen_status: Int
  }

  type Query {
    getNotifications(
      user_id: ID
      user_type: String
      limit: Int
    ): [Notifications]
    getQuotationNotifications(
      user_id: ID
      user_type: String
      type: String
      limit: Int
    ): [Notifications]

    getYesterdayNotifications(
      user_id: ID
      user_type: String
      limit: Int
    ): [Notifications]
    getYesterdayQuotationNotifications(
      user_id: ID
      user_type: String
      type: String
      limit: Int
    ): [Notifications]

    getNotification(id: ID!): Notifications
    getUnseenNotificationCount(user_id: ID, user_type: String): Int
    # getSentQuotations(sender_id: ID, limit: Int): [Quotations]
    # getSentQuotationModal(id: ID!): Quotations
    # getReceivedQuotationViewModal(id: ID!, user_id: ID!): Quotations
  }

  type Mutation {
    createNotification(input: NotificationInput): Notifications
    # seenNotification(id: ID!, input: NotificationUpdateInput): Notifications
    deleteNotification(id: ID!): successInfoNotifications
    updateUnseenNotificationCount(user_id: ID, user_type: String): Int
    # acceptQuotation(id: ID!, input: QuotationUpdateInput): Quotations
    # rejectQuotation(id: ID!, input: QuotationUpdateInput): Quotations
  }
`;

module.exports = notifications;
