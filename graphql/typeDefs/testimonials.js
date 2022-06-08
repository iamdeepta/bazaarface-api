const { gql } = require("apollo-server");

const testimonials = gql`
  scalar Upload

  type Testimonials {
    id: ID!
    name: String!
    comment: String!
    designation: String!
    image: String
    message: String
    success: Boolean
  }

  type successInfoTestimonial {
    message: String
    success: Boolean
  }

  input TestimonialInput {
    name: String
    comment: String
    designation: String
    file: Upload!
    bucketName: String!
  }

  input TestimonialUpdateInput {
    name: String
    comment: String
    designation: String
  }

  type Query {
    getTestimonials: [Testimonials]
    getTestimonial(id: ID!): Testimonials
  }

  type Mutation {
    createTestimonial(input: TestimonialInput): Testimonials
    updateTestimonial(id: ID, input: TestimonialUpdateInput): Testimonials
    updateTestimonialImage(
      id: ID!
      file: Upload!
      bucketName: String!
    ): Testimonials
    deleteTestimonial(id: ID!): successInfoTestimonial
  }
`;

module.exports = testimonials;
