const { gql } = require("apollo-server");

const announcements = gql`
  scalar Upload

  type Announcements {
    id: ID!
    title: String!
    semi_title: String
    description: String
    link: String
    image: String
    message: String
    success: Boolean
  }

  type successInfoAnnouncement {
    message: String
    success: Boolean
  }

  input AnnouncementInput {
    title: String!
    semi_title: String
    description: String
    link: String
    file: Upload!
    bucketName: String!
  }

  input AnnouncementUpdateInput {
    title: String!
    semi_title: String
    description: String
    link: String
  }

  type Query {
    getAnnouncements: [Announcements]
    getAnnouncement(id: ID!): Announcements
  }

  type Mutation {
    createAnnouncement(input: AnnouncementInput): Announcements
    updateAnnouncement(id: ID, input: AnnouncementUpdateInput): Announcements
    updateAnnouncementImage(
      id: ID!
      file: Upload!
      bucketName: String!
    ): Announcements
    deleteAnnouncement(id: ID!): successInfoAnnouncement
  }
`;

module.exports = announcements;
