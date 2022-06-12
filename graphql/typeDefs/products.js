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
    sizes: [String]
    manufacturer: String
    quantity: String
    auction_quantity: String
    marketplace_quantity: String
    category: String
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
    duration: String
    payment: String
    postedAtMarket: String
    postedAtAuction: String
    user: User
    message: String
    success: Boolean
  }

  type successInfoProducts {
    message: String
    success: Boolean
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
    duration: String
    payment: String
  }

  input AddToMarketplaceInput {
    id: ID!
    marketplace_quantity: String
    price: String
    total_marketplace_price: String
  }

  type Query {
    getProducts: [Products]
    getProduct(id: ID!): Products
    getAddToAuctionModal(id: ID!, user_id: ID!): Products
    getProductViewModal(id: ID!, user_id: ID!): Products
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
