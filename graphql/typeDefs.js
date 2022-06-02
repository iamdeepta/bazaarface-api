const { gql } = require("apollo-server");

module.exports = gql`
  type User {
    id: ID!
    firstname: String!
    lastname: String!
    email: String!
    token: String!
    otp: String!
    country_code: String!
    phone: String!
    company_name: String
    company_website: String
    country: String!
    city: String!
    isBuyer: Boolean
    isSeller: Boolean
    profile_image: String
    cover_image: String
    isAdmin: Boolean
    status: Int
  }
  input RegisterInput {
    firstname: String!
    lastname: String!
    email: String!
    password: String!
    confirmPassword: String!
    otp: String!
    country_code: String!
    phone: String!
    company_name: String!
    company_website: String!
    country: String!
    city: String!
    isBuyer: Boolean!
    isSeller: Boolean!
    profile_image: String!
    cover_image: String!
  }

  input UpdateUserInput {
    id: ID!
    firstname: String!
    lastname: String!
    country_code: String!
    phone: String!
    company_name: String!
    company_website: String!
    country: String!
    city: String!
    isBuyer: Boolean!
    isSeller: Boolean!
    profile_image: String!
    cover_image: String!
  }
  type Query {
    getUsers: [User]
    getUser(userId: ID!): User
  }
  type Mutation {
    register(registerInput: RegisterInput): User!
    login(email: String!, password: String!): User!
    getSignupOtp(email: String!, otp: String!): User
    updateUser(updateUserInput: UpdateUserInput): User
    deleteUser(userId: ID!): String!
  }
`;
