const { gql } = require("apollo-server");

const locations = gql`
  scalar Upload
  type Locations {
    id: ID!
    user_id: String!
    office: String
    address: String
    open_day1: String
    open_day2: String
    open_time1: String
    open_time2: String
    map: String
    message: String
    success: Boolean
  }

  type successInfoSellerLocation {
    message: String
    success: Boolean
  }

  input SellerLocationInput {
    office: String
    address: String
    open_day1: String
    open_day2: String
    open_time1: String
    open_time2: String
    file: Upload!
    bucketName: String!
  }

  input SellerLocationUpdateInput {
    office: String
    address: String
    open_day1: String
    open_day2: String
    open_time1: String
    open_time2: String
  }

  type Query {
    getSellerLocations: [Locations]
    getSellerLocation(id: ID!): Locations
  }

  type Mutation {
    createSellerLocation(user_id: ID!, input: SellerLocationInput): Locations!
    updateSellerLocation(id: ID, input: SellerLocationUpdateInput): Locations
    updateSellerLocationImage(
      id: ID!
      file: Upload!
      bucketName: String!
    ): Locations
    deleteSellerLocation(id: ID!): successInfoSellerLocation
  }
`;

module.exports = locations;
