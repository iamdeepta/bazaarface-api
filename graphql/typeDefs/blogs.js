const { gql } = require("apollo-server");

const blogs = gql`
  scalar Upload
  scalar DateTime

  type Blogs {
    id: ID!
    title: String!
    description: String!
    time: String
    category: String
    image: [String]
    likes: [Like]
    user: User
    users: [SingleUser]
    buyers: [SingleBuyer]
    sellers: [SingleSeller]
    totalLikes: Int
    createdAt: DateTime
    message: String
    success: Boolean
  }

  type successInfoBlogs {
    message: String
    success: Boolean
  }

  type Like {
    # user_id: String
    # user_type: String
    like_name: String
    like_image: String
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

  input BlogInput {
    title: String!
    description: String!
    category: String
    time: String
    files: [Upload!]
    bucketName: String
  }

  input BlogUpdateInput {
    title: String
    description: String
    category: String
    time: String
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
    getBlogs: [Blogs]
    getBlog(id: ID!): Blogs
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
    createBlog(input: BlogInput): Blogs
    updateBlog(id: ID!, input: BlogUpdateInput): Blogs
    updateBlogImage(
      id: ID!
      pic_name: String!
      file: Upload!
      bucketName: String!
    ): successInfoBlogs
    deleteBlogImage(
      id: ID!
      pic_name: [String!]!
      bucketName: String!
    ): successInfoBlogs

    addBlogLike(id: ID!, user_id: String, user_type: String): successInfoBlogs

    # addToAuction(user_id: ID!, input: AddToAuctionInput): Products
    # addToMarketplace(user_id: ID!, input: AddToMarketplaceInput): Products
  }
`;

module.exports = blogs;
