const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");

const mongoose = require("mongoose");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Conversation = require("../../models/Conversation");
const User = require("../../models/User");
const Seller = require("../../models/Seller");
const Buyer = require("../../models/Buyer");
const Message = require("../../models/Message");

const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

module.exports = {
  Query: {
    //get conversations
    async getConversations(parent, args, context) {
      const { receiver_id, receiver_user_type, search_text } = args;

      try {
        var conversations = [];
        const conversation = await Conversation.aggregate([
          {
            $match: {
              receiver_id: receiver_id,
              receiver_user_type: receiver_user_type,
            },
          },
          {
            $addFields: {
              sender_id: { $toObjectId: "$sender_id" },
              senders_id: { $toString: "$sender_id" },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "sender_id",
              foreignField: "_id",
              as: "sender",
            },
          },

          {
            $lookup: {
              from: "sellers",
              localField: "senders_id",
              foreignField: "user_id",
              as: "sellers",
            },
          },
          {
            $lookup: {
              from: "buyers",
              localField: "senders_id",
              foreignField: "user_id",
              as: "buyers",
            },
          },
        ]).sort({ createdAt: -1 });

        const seen_conversation = await Conversation.updateMany(
          { receiver_id: receiver_id, receiver_user_type: receiver_user_type },
          {
            $set: { status: 1 },
          },
          { new: true }
        );

        for (var i = 0; i < conversation.length; i++) {
          const message = await Message.find({
            conversation_id: conversation[0]._id,
          })
            .sort({ _id: -1 })
            .limit(1);
          const message_count = await Message.find({
            conversation_id: conversation[0]._id,
            status: 0,
          });
          conversations.push({
            ...conversation[i],
            id: conversation[i]._id,
            messages: message,
            unread_message_count: message_count.length,
          });
        }
        //console.log(conversations[0].users);
        //search by user name or company name

        if (search_text.trim() !== "") {
          var convos = [];
          for (var j = 0; j < conversations.length; j++) {
            if (
              conversations[j].sender_user_type === "Buyer" &&
              conversations[j].sender[0].firstname
                .trim()
                .toLowerCase()
                .includes(search_text.trim().toLowerCase())
            ) {
              convos.push({ ...conversations[j] });
              //console.log(convos);
              //return convos;
            } else if (
              conversations[j].sender_user_type === "Seller" &&
              conversations[j].sender[0].company_name
                .trim()
                .toLowerCase()
                .includes(search_text.trim().toLowerCase())
            ) {
              convos.push({ ...conversations[j] });
              //console.log(convos);
              //return convos;
            }
          }
        } else {
          //console.log(conversations);
          convos = conversations;
          //return convos;
        }

        return convos;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get unread conversation count
    async getUnreadConversationCount(parent, args, context) {
      const { receiver_id, receiver_user_type } = args;

      try {
        const conversation = await Conversation.aggregate([
          {
            $match: {
              receiver_id: receiver_id,
              receiver_user_type: receiver_user_type,
              status: 0,
            },
          },
        ]);

        if (conversation) {
          const convo_length = conversation.length;
          //console.log(conversations[0].users);
          return convo_length;
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    //get messages
    async getMessages(parent, args, context) {
      const { conversation_id } = args;

      try {
        var messages = [];
        const message = await Message.aggregate([
          { $match: { conversation_id: conversation_id } },
          {
            $addFields: {
              sender_id: { $toObjectId: "$sender_id" },
              senders_id: { $toString: "$sender_id" },
            },
          },

          {
            $lookup: {
              from: "users",
              localField: "sender_id",
              foreignField: "_id",
              as: "sender",
            },
          },

          {
            $lookup: {
              from: "sellers",
              localField: "senders_id",
              foreignField: "user_id",
              as: "sellers",
            },
          },
          {
            $lookup: {
              from: "buyers",
              localField: "senders_id",
              foreignField: "user_id",
              as: "buyers",
            },
          },
        ]);

        const seen_message = await Message.updateMany(
          { conversation_id: conversation_id },
          {
            $set: { status: 1 },
          },
          { new: true }
        );

        for (var i = 0; i < message.length; i++) {
          messages.push({
            ...message[i],
            id: message[i]._id,
          });
        }
        //console.log(conversations[0].users);
        return messages;
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  // Upload: GraphQLUpload,

  Mutation: {
    //create conversation
    async createConversation(
      _,
      {
        input: { sender_id, receiver_id, sender_user_type, receiver_user_type },
      },
      context
    ) {
      //const user_check = await checkAuth(context);
      const existing_convo = await Conversation.find({
        sender_id: { $in: [sender_id, receiver_id] },
        receiver_id: { $in: [sender_id, receiver_id] },
        sender_user_type,
        receiver_user_type,
      });
      //console.log(existing_convo.length);
      try {
        //if (user_check.isAdmin) {
        if (existing_convo.length <= 0) {
          if (
            sender_id.trim() !== "" &&
            receiver_id.trim() !== "" &&
            sender_user_type.trim() !== "" &&
            receiver_user_type.trim() !== ""
          ) {
            const conversation = new Conversation({
              sender_id,
              receiver_id,
              sender_user_type,
              receiver_user_type,
            });

            const res = await conversation.save();

            pubsub.publish("NEW_CONVERSATION", {
              newConversation: {
                ...res._doc,
                id: res._id,
                message: "Conversation is created.",
                success: true,
              },
            });

            return {
              ...res._doc,
              id: res._id,
              message: "Conversation is created.",
              success: true,
            };
          } else {
            return {
              ...res._doc,
              id: res._id,
              message: "Please fill up all the fields.",
              success: false,
            };
          }
        } else {
          throw new Error("Conversation already exists");
        }
        // } else {
        //   throw new AuthenticationError("Action not allowed");
        // }
      } catch (err) {
        throw new UserInputError("Errors occcur while creating conversation");
      }
    },

    //create message
    async createMessage(
      _,
      { input: { conversation_id, sender_id, sender_user_type, text } },
      context
    ) {
      //const user_check = await checkAuth(context);

      try {
        //if (user_check.isAdmin) {
        if (
          conversation_id.trim() !== "" &&
          sender_id.trim() !== "" &&
          sender_user_type.trim() !== "" &&
          text.trim() !== ""
        ) {
          const messages = new Message({
            conversation_id,
            sender_id,
            sender_user_type,
            text,
          });

          const res = await messages.save();

          const seen_conversation = await Conversation.updateOne(
            {
              _id: mongoose.Types.ObjectId(conversation_id),
            },
            {
              $set: { status: 0 },
            },
            { new: true }
          );

          pubsub.publish("NEW_MESSAGE", {
            newMessage: {
              ...res._doc,
              id: res._id,
              message: "Message is sent.",
              success: true,
            },
          });

          return {
            ...res._doc,
            id: res._id,
            message: "Message is sent.",
            success: true,
          };
        } else {
          return {
            ...res._doc,
            id: res._id,
            message: "Please fill up all the fields.",
            success: false,
          };
        }
        // } else {
        //   throw new AuthenticationError("Action not allowed");
        // }
      } catch (err) {
        throw new UserInputError("Errors occcur while sending message");
      }
    },
  },

  Subscription: {
    newMessage: {
      subscribe: (_, __, context) => pubsub.asyncIterator(["NEW_MESSAGE"]),
    },
    newConversation: {
      subscribe: (_, __, context) => pubsub.asyncIterator(["NEW_CONVERSATION"]),
    },
  },
};
