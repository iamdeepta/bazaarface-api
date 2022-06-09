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
    category: String
    fabric: String
    supplier: String
    gsm: String
    country: String
    price: String
    image: [String]
    isAuction: Boolean
    isMarketplace: Boolean
    duration: String
    payment: String
    postedAtMarket: String
    postedAtAuction: String
    message: String
    success: Boolean
  }

  type successInfoProducts {
    message: String
    success: Boolean
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

  type Query {
    getProducts: [Products]
    getProduct(id: ID!): Products
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
  }
`;

module.exports = products;
