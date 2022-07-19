const { gql } = require("apollo-server");

const productCategories = gql`
  scalar Upload

  type ProductCategories {
    id: ID!
    name: String!
    image: String
    message: String
    success: Boolean
  }

  type ProductCategoriesWithTotal {
    id: ID!
    name: String
    image: String
    total: Int
  }

  type successInfoProductCategory {
    message: String
    success: Boolean
  }

  input ProductCategoryInput {
    name: String
    file: Upload!
    bucketName: String!
  }

  input ProductCategoryUpdateInput {
    name: String
  }

  type Query {
    getProductCategories: [ProductCategories]
    getProductCategory(id: ID!): ProductCategories

    getProductCategoriesWithTotalProductCount: [ProductCategoriesWithTotal]
  }

  type Mutation {
    createProductCategory(input: ProductCategoryInput): ProductCategories
    updateProductCategory(
      id: ID
      input: ProductCategoryUpdateInput
    ): ProductCategories
    updateProductCategoryImage(
      id: ID!
      file: Upload!
      bucketName: String!
    ): ProductCategories
    deleteProductCategory(id: ID!): successInfoProductCategory
  }
`;

module.exports = productCategories;
