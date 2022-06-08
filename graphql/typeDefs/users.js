const { gql } = require("apollo-server");
//const Object = require("./Object");
// const Response = require("./Response");

const user = gql`
  scalar Upload

  type Object {
    # url: String!
    key: String!
    message: String
    success: String
  }

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

  type successInfo {
    message: String
    success: Boolean
    token: String
  }

  type forgotOtp {
    message: String
    success: Boolean
  }

  type resetPassword {
    message: String
    success: Boolean
  }

  type uploadProfilePic {
    message: String
    success: Boolean
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
    firstname: String
    lastname: String
    country_code: String
    phone: String
    company_name: String
    company_website: String
    country: String
    city: String
    isBuyer: Boolean
    isSeller: Boolean
    profile_image: String
    cover_image: String
  }

  input ResetPasswordInput {
    email: String
    password: String
    confirmPassword: String
  }

  input authInput {
    idToken: String
  }

  type Query {
    getUsers: [User]
    getUser(userId: ID!): User
  }
  type Mutation {
    register(registerInput: RegisterInput): User!
    login(email: String!, password: String!): User!
    getSignupOtp(email: String!, otp: String!): User
    updateUser(userId: ID, updateUserInput: UpdateUserInput): User
    deleteUser(userId: ID!): String!
    googleAuth(input: authInput): successInfo
    getForgotOtp(email: String!, otp: String!): forgotOtp
    resetPassword(input: ResetPasswordInput): resetPassword
    uploadObject(email: String!, file: Upload!, bucketName: String!): Object
    uploadCoverImage(email: String!, file: Upload!, bucketName: String!): Object
  }
`;

module.exports = user;