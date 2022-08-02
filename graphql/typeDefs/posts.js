const { gql } = require("apollo-server");

const posts = gql`
  scalar Upload
  scalar DateTime

  type Posts {
    id: ID!
    user_id: String!
    user_type: String!
    seller_id: String
    buyer_id: String
    text: String
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

  type successInfoPosts {
    message: String
    success: Boolean
  }

  type Like {
    user_id: String
    user_type: String
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

  input PostInput {
    user_id: String!
    user_type: String!
    seller_id: String
    buyer_id: String
    text: String
    files: [Upload!]
    bucketName: String
  }

  input PostUpdateInput {
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
    getPosts(
      user_id: ID
      user_type: String
      seller_id: String
      buyer_id: String
    ): [Posts]
    getPost(id: ID!): Posts
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
    createPost(input: PostInput): Posts
    updatePost(id: ID!, input: PostUpdateInput): Posts
    updatePostImage(
      id: ID!
      pic_name: String!
      file: Upload!
      bucketName: String!
    ): successInfoPosts
    deletePostImage(
      id: ID!
      pic_name: [String!]!
      bucketName: String!
    ): successInfoPosts

    addPostLike(id: ID!, user_id: String, user_type: String): successInfoPosts

    # addToAuction(user_id: ID!, input: AddToAuctionInput): Products
    # addToMarketplace(user_id: ID!, input: AddToMarketplaceInput): Products
  }
`;

module.exports = posts;
