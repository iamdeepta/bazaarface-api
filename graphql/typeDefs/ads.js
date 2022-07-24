const { gql } = require("apollo-server");

const ads = gql`
  scalar Upload
  scalar DateTime

  type Ads {
    id: ID!
    user_id: String!
    user_type: String!
    name: String!
    description: String!
    phone: String!
    location: String
    quantity: String
    category: String
    country: String
    price: String
    type: String
    ad_for: String
    image: [String]
    user: User
    createdAt: String
    message: String
    success: Boolean
  }

  type successInfoAds {
    message: String
    success: Boolean
  }

  type MoreLikeThisAd {
    id: ID
    name: String
    user_id: String
    user_type: String
    location: String
    price: String
    quantity: String
    description: String
    type: String
    ad_for: String
    phone: String
    image: [String]
    adtypes: [AdTypes]
    country: String
    createdAt: DateTime
    category: String
    users: [User]
    sellers: [Seller]
    buyers: [Buyer]
  }

  type AdTypes {
    name: String
  }

  type User {
    firstname: String
    lastname: String
    company_name: String
    city: String
    profile_image: String
    seller: Seller
    buyer: Buyer
  }

  type Seller {
    profile_image: String
  }

  type Buyer {
    profile_image: String
    designation: String
  }

  input AdInput {
    user_id: String!
    user_type: String!
    name: String!
    description: String!
    phone: String!
    location: String
    quantity: String
    category: String
    country: String
    price: String
    type: String
    ad_for: String
    files: [Upload!]!
    bucketName: String!
  }

  input AdUpdateInput {
    name: String
    description: String
    phone: String
    location: String
    quantity: String
    category: String
    country: String
    price: String
    type: String
    ad_for: String
  }

  type Query {
    getAds: [Ads]
    getAd(id: ID!): Ads
    getTenAds: [Ads]
    getAdDetail(id: ID!): MoreLikeThisAd
    getAdMoreLikeThis(category_id: ID!): [MoreLikeThisAd]
    getAdFilter(
      category_id: String
      ad_for: String
      sort_by: String
      user_type: String
      type: String
      country: String
      search_text: String
      limit: Int
    ): [MoreLikeThisAd]

    getTotalAd: Int
  }

  type Mutation {
    createAd(input: AdInput): Ads
    updateAd(id: ID!, input: AdUpdateInput): Ads
    updateAdImage(
      id: ID!
      pic_name: String!
      file: Upload!
      bucketName: String!
    ): successInfoAds
    deleteAdImage(
      id: ID!
      pic_name: [String!]!
      bucketName: String!
    ): successInfoAds
  }
`;

module.exports = ads;
