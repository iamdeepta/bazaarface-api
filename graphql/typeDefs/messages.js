const { gql } = require("apollo-server");

const messages = gql`
  #   scalar Upload
  scalar DateTime

  type Conversations {
    id: ID!
    sender_id: String
    sender: [User]
    receiver_id: String
    receiver: [User]
    sender_user_type: String
    receiver_user_type: String
    user_name: String
    profile_image: String
    status: Int
    buyers: [SingleBuyer]
    sellers: [SingleSeller]
    receiver_sellers: [SingleSeller]
    receiver_buyers: [SingleBuyer]
    messages: [Messages]
    unread_message_count: Int
    message: String
    success: Boolean
  }

  type successInfoMessages {
    message: String
    success: Boolean
  }

  type User {
    firstname: String
    lastname: String
    company_name: String
    city: String
    country: String
    user_type: String
  }

  type SingleSeller {
    profile_image: String
    description: String
    total_followers: Int
  }

  type SingleBuyer {
    profile_image: String
  }

  type Messages {
    id: ID!
    sender_id: String!
    sender: [User]
    sender_user_type: String
    text: String!
    status: Int
    buyers: [SingleBuyer]
    sellers: [SingleSeller]
    createdAt: DateTime
    message: String
    success: Boolean
  }

  input ConversationsInput {
    sender_id: String!
    receiver_id: String!
    sender_user_type: String
    receiver_user_type: String
  }

  input MessagesInput {
    conversation_id: String!
    sender_id: String!
    sender_user_type: String
    text: String!
  }

  input MessageUpdateInput {
    status: Int
  }

  input ConversationUpdateInput {
    status: Int
  }

  type Query {
    getConversations(
      receiver_id: ID
      receiver_user_type: String
      search_text: String
    ): [Conversations]
    # getConversation(id: ID!): Conversations
    getMessages(conversation_id: ID!): [Messages]
    getUnreadConversationCount(receiver_id: ID, receiver_user_type: String): Int
  }

  type Mutation {
    createConversation(input: ConversationsInput): Conversations
    createMessage(input: MessagesInput): Messages
    # updateConversationStatus(
    #   id: ID!
    #   input: ConversationUpdateInput
    # ): successInfoMessages
    # updateMessageStatus(id: ID!, input: MessageUpdateInput): successInfoMessages
  }

  type Subscription {
    newMessage: Messages
    newConversation: Conversations
  }
`;

module.exports = messages;
