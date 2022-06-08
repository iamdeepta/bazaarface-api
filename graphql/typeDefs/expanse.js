const { gql } = require("apollo-server");

const expanse = gql`
  type Expanse {
    id: ID!
    countries: String!
    product_sample: String!
    companies: String!
    business_contacts: String!
    message: String
    success: Boolean
  }

  type successInfoExpanse {
    message: String
    success: Boolean
  }

  input ExpanseInput {
    countries: String
    product_sample: String
    companies: String
    business_contacts: String
  }

  type Query {
    getExpanse: [Expanse]
  }

  type Mutation {
    createExpanse(input: ExpanseInput): Expanse!
    updateExpanse(id: ID, input: ExpanseInput): Expanse
  }
`;

module.exports = expanse;
