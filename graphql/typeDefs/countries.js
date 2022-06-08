const { gql } = require("apollo-server");

const countries = gql`
  type Countries {
    id: ID!
    name: String!
    code: String!
    message: String
    success: Boolean
  }

  type successInfoCountries {
    message: String
    success: Boolean
  }

  input CountryInput {
    name: String
    code: String
  }

  type Query {
    getCountries: [Countries]
    getCountry(id: ID!): Countries
  }

  type Mutation {
    createCountry(input: CountryInput): Countries!
    updateCountry(id: ID, input: CountryInput): Countries
    deleteCountry(id: ID!): successInfoCountries
  }
`;

module.exports = countries;
