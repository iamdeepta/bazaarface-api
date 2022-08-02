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
    country: String
    city: String!
    isBuyer: Boolean
    isSeller: Boolean
    buyers: [SingleBuyer]
    sellers: [SingleSeller]
    profile_image: String
    cover_image: String
    isAdmin: Boolean
    status: Int
  }

  type PeopleYouMayKnow {
    id: ID!
    user_id: String!
    user_type: String!
    seller_id: String
    buyer_id: String
    user: User
    users: [SingleUser]
    buyers: [SingleBuyer]
    sellers: [SingleSeller]
    message: String
    success: Boolean
  }

  type SingleBuyer {
    profile_image: String
    cover_image: String
    description: String
    designation: String
    followers: [Follower]
    following: [Following]
  }

  type SingleSeller {
    profile_image: String
    cover_image: String
    description: String
    followers: [Follower]
    following: [Following]
  }

  type SingleUser {
    firstname: String
    lastname: String
    company_name: String
    city: String
    country: String
  }

  type Follower {
    user_id: String
    user_type: String
  }

  type Following {
    user_id: String
    user_type: String
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
    isPhone: Boolean!
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
    isAdmin: Boolean
    user_type: String
    profile_image: String
    cover_image: String
  }

  input ResetPasswordInput {
    email: String
    password: String
    confirmPassword: String
    otp: String
  }

  input authInput {
    idToken: String
    user_type: String
    isBuyer: Boolean
    isSeller: Boolean
    country: String
    country_code: String
    city: String
    phone: String
    company_website: String
  }

  type Query {
    getUsers: [User]
    getUser(userId: ID!): User
    getTotalUser: Int
    getPeopleYouMayKnow(user_id: String, user_type: String): [PeopleYouMayKnow]
  }
  type Mutation {
    register(registerInput: RegisterInput): User!
    login(email: String!, password: String!): User!
    getSignupOtp(email: String!): User
    updateUser(userId: ID, updateUserInput: UpdateUserInput): User
    deleteUser(userId: ID!): String!
    googleAuth(input: authInput): successInfo
    confirmForgotOtp(email: String, otp: String): successInfo
    getForgotOtp(email: String!): forgotOtp
    resetPassword(input: ResetPasswordInput): resetPassword
    uploadObject(email: String!, file: Upload!, bucketName: String!): Object
    uploadCoverImage(email: String!, file: Upload!, bucketName: String!): Object
  }
`;

module.exports = user;
