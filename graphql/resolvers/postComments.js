const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");
const PostImageResolver = require("./post_image_resolvers");
const mongoose = require("mongoose");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Seller = require("../../models/Seller");
const Buyer = require("../../models/Buyer");
const Post = require("../../models/Post");
const PostComment = require("../../models/PostComment");

const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

module.exports = {
  Query: {
    //get post comments
    async getPostComments(parent, args, context) {
      const { post_id, sender_id, sender_user_type, limit } = args;

      try {
        var postComments = [];
        const postComment = await PostComment.aggregate([
          { $match: { post_id: post_id } },
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
              as: "senders",
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
        ])
          .sort({ createdAt: 0 })
          .limit(limit);

        for (var i = 0; i < postComment.length; i++) {
          postComments.push({
            ...postComment[i],
            id: postComment[i]._id,
            totalComment: postComment.length,
          });
        }
        //console.log(products);
        return postComments;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get single post comment
    async getPostComment(_, { id }, context) {
      try {
        const postComment = await PostComment.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(id) } },
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
              as: "senders",
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

        if (postComment) {
          //console.log(product[0]);
          return {
            ...postComment[0],
            id: postComment[0]._id,
          };
        } else {
          throw new Error("Post Comment not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  // Upload: GraphQLUpload,

  Mutation: {
    //create post comment
    async createPostComment(
      _,
      { input: { post_id, sender_id, sender_user_type, text } },
      context
    ) {
      //const user_check = await checkAuth(context);
      try {
        //if (user_check.isAdmin) {
        if (
          post_id.trim() !== "" &&
          sender_id.trim() !== "" &&
          sender_user_type.trim() !== "" &&
          text.trim() !== ""
        ) {
          const postComment = new PostComment({
            post_id,
            sender_id,
            sender_user_type,
            text,
          });

          const res = await postComment.save();

          //send noti

          //   if (res) {
          //     res_id = res._id.toString();
          //     const notification = new Notifications({
          //       type: "received_quotation",
          //       visitor_id: sender_id,
          //       user_id: receiver_id,
          //       visitor_user_type: sender_user_type,
          //       user_type: receiver_user_type,
          //       product_id,
          //       quotation_id: res_id,
          //       text: "Someone sent you a quotation",
          //     });

          //     const res_noti = await notification.save();

          //   }

          pubsub.publish("NEW_POST_COMMENT", {
            newPostComment: {
              ...res._doc,
              id: res._id,
              message: "Comment is added.",
              success: true,
            },
          });

          return {
            ...res._doc,
            id: res._id,
            message: "You commented on this post.",
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
        throw new UserInputError("Errors occcur while commenting");
      }
    },

    //update post comment
    async updatePostComment(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id } = args;
      const { text } = args.input;

      const updates = {};

      if (text !== undefined && text.trim() !== "") {
        updates.text = text;
      } else {
        throw new Error("Please write something");
      }

      // TODO: Make sure user doesnt already exist
      try {
        // if (user_check.isAdmin) {
        const postComment = await PostComment.findByIdAndUpdate(
          id,
          {
            $set: updates,
          },
          { new: true }
        );
        return {
          ...postComment._doc,
          message: "Comment is updated successfully.",
          success: true,
        };
        // } else {
        //   throw new AuthenticationError("Action not allowed");
        // }
      } catch (err) {
        //throw new UserInputError("Errors", { errors });
        throw new UserInputError("Errors occcur while updating");
      }
    },

    //delete post comment
    async deletePostComment(parent, args, context, info) {
      const { id } = args;
      try {
        const postComment = await PostComment.deleteOne({ _id: id });

        return {
          message: "Comment deleted.",
          success: true,
        };
      } catch (err) {
        throw new UserInputError("Errors occcur while deleting");
      }
    },
  },

  Subscription: {
    newPostComment: {
      subscribe: (_, __, context) => pubsub.asyncIterator(["NEW_POST_COMMENT"]),
    },
  },
};
