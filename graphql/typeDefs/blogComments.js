const { gql } = require("apollo-server");

const blogComments = gql`
  #   scalar Upload
  scalar DateTime

  type BlogComments {
    id: ID!
    blog_id: String!
    blogs: [SingleBlog]
    sender_id: String!
    sender_user_type: String!
    text: String!
    sender: User
    senders: [SingleUser]
    buyers: [SingleBuyer]
    sellers: [SingleSeller]
    totalComment: Int
    createdAt: DateTime
    status: Int
    message: String
    success: Boolean
  }

  type successInfoBlogComments {
    message: String
    success: Boolean
  }

  type SingleBlog {
    title: String
    description: String
    image: [String]
    category: String
    time: String
  }

  type SingleUser {
    firstname: String
    lastname: String
    company_name: String
    city: String
    country: String
  }

  type User {
    company_name: String
    firstname: String
    city: String
    country: String
    seller: Seller
    buyer: Buyer
  }

  type Seller {
    profile_image: String
  }

  type Buyer {
    profile_image: String
  }

  type SingleSeller {
    profile_image: String
    description: String
    total_followers: Int
  }

  type SingleBuyer {
    profile_image: String
  }

  input BlogCommentInput {
    blog_id: String!
    sender_id: String!
    sender_user_type: String!
    text: String!
  }

  input BlogCommentUpdateInput {
    text: String
  }

  #   input AddToAuctionInput {
  #     id: ID!
  #     auction_quantity: String
  #     price: String
  #     total_auction_price: String
  #     duration: Int
  #     payment: String
  #   }

  #   input AddToMarketplaceInput {
  #     id: ID!
  #     marketplace_quantity: String
  #     price: String
  #     total_marketplace_price: String
  #   }

  type Query {
    getBlogComments(
      blog_id: ID
      sender_id: String
      sender_user_type: String
      limit: Int
    ): [BlogComments]
    getBlogCommentsAdmin(blog_id: ID, limit: Int): [BlogComments]
    getBlogComment(id: ID!): BlogComments
    # getProductsMoreLikeThis(category_id: ID!): [Products]
    # getAddToAuctionModal(id: ID!, user_id: ID!): Products
    # getProductViewModal(id: ID!, user_id: ID!): Products

    # getAuctionProducts(
    #   category_id: ID
    #   country_id: [String]
    #   limit: Int
    # ): [Products]
    # getAuctionProductModalView(id: ID!): Products
    # getAuctionProductsMoreLikeThis(category_id: ID!): [Products]
  }

  type Mutation {
    createBlogComment(input: BlogCommentInput): BlogComments
    updateBlogComment(id: ID!, input: BlogCommentUpdateInput): BlogComments
    approveBlogComment(id: ID!): BlogComments
    declineBlogComment(id: ID!): BlogComments
    # updatePostImage(
    #   id: ID!
    #   pic_name: String!
    #   file: Upload!
    #   bucketName: String!
    # ): successInfoPosts
    deleteBlogComment(id: ID!): successInfoBlogComments

    # addPostLike(id: ID!, user_id: String, user_type: String): successInfoPosts

    # addToAuction(user_id: ID!, input: AddToAuctionInput): Products
    # addToMarketplace(user_id: ID!, input: AddToMarketplaceInput): Products
  }

  type Subscription {
    newBlogComment: BlogComments
  }
`;

module.exports = blogComments;
