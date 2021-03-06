const { gql } = require("apollo-server");

const products = gql`
  scalar Upload

  type Products {
    id: ID!
    user_id: String!
    user_type: String!
    name: String!
    description: String!
    gender: String!
    colors: [String]
    color_with_code: [ColorWithCode]
    sizes: [String]
    manufacturer: String
    quantity: String
    auction_quantity: String
    marketplace_quantity: String
    category: String
    category_id: String
    fabric: String
    supplier: String
    gsm: String
    country: String
    price: String
    total_auction_price: String
    total_marketplace_price: String
    image: [String]
    isAuction: Boolean
    isMarketplace: Boolean
    duration: Int
    payment: String
    highest_bid_price: String
    postedAtMarket: String
    postedAtAuction: String
    user: User
    users: [SingleUser]
    buyers: [SingleBuyer]
    sellers: [SingleSeller]
    message: String
    success: Boolean
  }

  type successInfoProducts {
    message: String
    success: Boolean
  }

  type ColorWithCode {
    name: String
    code: String
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

  input ProductInput {
    user_id: String!
    user_type: String!
    name: String!
    description: String!
    gender: String!
    colors: [String]
    sizes: [String]
    manufacturer: String
    quantity: String
    category: String
    fabric: String
    supplier: String
    gsm: String
    country: String
    price: String
    files: [Upload!]!
    bucketName: String!
  }

  input ProductUpdateInput {
    name: String
    description: String
    gender: String
    colors: [String]
    sizes: [String]
    manufacturer: String
    quantity: String
    category: String
    fabric: String
    supplier: String
    gsm: String
    country: String
    price: String
  }

  input AddToAuctionInput {
    id: ID!
    auction_quantity: String
    price: String
    total_auction_price: String
    duration: Int
    payment: String
  }

  input AddToMarketplaceInput {
    id: ID!
    marketplace_quantity: String
    price: String
    total_marketplace_price: String
  }

  type Query {
    getProducts(category_id: ID, country_id: [String], limit: Int): [Products]
    getSellerProducts(user_id: ID, user_type: String, limit: Int): [Products]
    getProduct(id: ID!): Products
    getProductsMoreLikeThis(category_id: ID!): [Products]
    getAddToAuctionModal(id: ID!, user_id: ID!): Products
    getProductViewModal(id: ID!, user_id: ID!): Products

    getAuctionProducts(
      category_id: ID
      country_id: [String]
      limit: Int
    ): [Products]
    getAuctionProductModalView(id: ID!): Products
    getAuctionProductsMoreLikeThis(category_id: ID!): [Products]

    getTotalProduct: Int
    getTotalAuctionProduct: Int
  }

  type Mutation {
    createProduct(input: ProductInput): Products
    updateProduct(id: ID!, input: ProductUpdateInput): Products
    updateProductImage(
      id: ID!
      pic_name: String!
      file: Upload!
      bucketName: String!
    ): successInfoProducts
    deleteProductImage(
      id: ID!
      pic_name: [String!]!
      bucketName: String!
    ): successInfoProducts

    addToAuction(user_id: ID!, input: AddToAuctionInput): Products
    addToMarketplace(user_id: ID!, input: AddToMarketplaceInput): Products
  }
`;

module.exports = products;
