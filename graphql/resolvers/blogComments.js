const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");
const BlogImageResolver = require("./blog_image_resolvers");
const mongoose = require("mongoose");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Seller = require("../../models/Seller");
const Buyer = require("../../models/Buyer");
const Post = require("../../models/Post");
const BlogComment = require("../../models/BlogComment");
const BuyerActivities = require("../../models/BuyerActivity");

const { PubSub } = require("graphql-subscriptions");
const BuyerActivity = require("../../models/BuyerActivity");
const Blog = require("../../models/Blog");
const Notifications = require("../../models/Notification");

const pubsub = new PubSub();

module.exports = {
  Query: {
    //get blog comments
    async getBlogComments(parent, args, context) {
      const { blog_id, sender_id, sender_user_type, limit } = args;

      try {
        var blogComments = [];
        const blogComment = await BlogComment.aggregate([
          { $match: { blog_id: blog_id, status: 1 } },
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

        for (var i = 0; i < blogComment.length; i++) {
          blogComments.push({
            ...blogComment[i],
            id: blogComment[i]._id,
            totalComment: blogComment.length,
          });
        }
        //console.log(products);
        return blogComments;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get blog comments for admin
    async getBlogCommentsAdmin(parent, args, context) {
      const { blog_id, sender_id, sender_user_type, limit } = args;

      try {
        var blogComments = [];
        const blogComment = await BlogComment.aggregate([
          { $match: { blog_id: blog_id } },
          {
            $addFields: {
              sender_id: { $toObjectId: "$sender_id" },
              senders_id: { $toString: "$sender_id" },
              blog_id: { $toObjectId: "$blog_id" },
            },
          },
          {
            $lookup: {
              from: "blogs",
              localField: "blog_id",
              foreignField: "_id",
              as: "blogs",
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

        for (var i = 0; i < blogComment.length; i++) {
          blogComments.push({
            ...blogComment[i],
            id: blogComment[i]._id,
            totalComment: blogComment.length,
          });
        }
        //console.log(products);
        return blogComments;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get single blog comment
    async getBlogComment(_, { id }, context) {
      try {
        const blogComment = await BlogComment.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(id), status: 1 } },
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

        if (blogComment) {
          //console.log(product[0]);
          return {
            ...blogComment[0],
            id: blogComment[0]._id,
          };
        } else {
          throw new Error("Blog Comment not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  // Upload: GraphQLUpload,

  Mutation: {
    //create blog comment
    async createBlogComment(
      _,
      { input: { blog_id, sender_id, sender_user_type, text } },
      context
    ) {
      //const user_check = await checkAuth(context);
      try {
        //if (user_check.isAdmin) {
        if (
          blog_id.trim() !== "" &&
          sender_id.trim() !== "" &&
          sender_user_type.trim() !== "" &&
          text.trim() !== ""
        ) {
          const blogComment = new BlogComment({
            blog_id,
            sender_id,
            sender_user_type,
            text,
          });

          const res = await blogComment.save();

          if (res && sender_user_type === "Buyer") {
            //send activity
            const activity = new BuyerActivities({
              type: "comment_blog",
              user_id: sender_id,
              user_type: sender_user_type,
              blog_id: blog_id,
              text: "You commented on a blog",
            });

            const res_activity = await activity.save();
          }

          //send activity

          //   if (res && sender_user_type === "Buyer") {
          //     const activity = new BuyerActivity({
          //       type: "comment_blog",

          //       user_id: sender_id,

          //       user_type: sender_user_type,
          //       blog_id: blog_id,

          //       text: "You commented on a blog",
          //     });

          //     const res_act = await activity.save();
          //   }

          pubsub.publish("NEW_BLOG_COMMENT", {
            newBlogComment: {
              ...res._doc,
              id: res._id,
              message: "Comment is added.",
              success: true,
            },
          });

          return {
            ...res._doc,
            id: res._id,
            message: "You commented on this blog.",
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

    //update blog comment
    async updateBlogComment(parent, args, context, info) {
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
        const blogComment = await BlogComment.findByIdAndUpdate(
          id,
          {
            $set: updates,
          },
          { new: true }
        );
        return {
          ...blogComment._doc,
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

    //approve blog comment
    async approveBlogComment(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id } = args;
      //const { text } = args.input;

      // TODO: Make sure user doesnt already exist
      try {
        if (user_check.isAdmin) {
          const blogComment = await BlogComment.findByIdAndUpdate(
            id,
            {
              $set: { status: 1 },
            },
            { new: true }
          );

          if (blogComment) {
            const blog = await Blog.findById(blogComment.blog_id);

            //send noti
            if (blog) {
              var blog_id = blog._id.toString();
              const notification = new Notifications({
                type: "approve_blog_comment",
                user_id: blogComment.sender_id,
                user_type: blogComment.sender_user_type,
                blog_id: blog_id,
                text: "Your comment is approved in a blog",
              });

              const res_noti = await notification.save();
            }
          }
          return {
            ...blogComment._doc,
            message: "Comment is approved successfully.",
            success: true,
          };
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        //throw new UserInputError("Errors", { errors });
        throw new UserInputError("Errors occcur while approving");
      }
    },

    //decline blog comment
    async declineBlogComment(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id } = args;
      //const { text } = args.input;

      // TODO: Make sure user doesnt already exist
      try {
        if (user_check.isAdmin) {
          const blogComment = await BlogComment.findByIdAndUpdate(
            id,
            {
              $set: { status: 0 },
            },
            { new: true }
          );
          return {
            ...blogComment._doc,
            message: "Comment is declined successfully.",
            success: true,
          };
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        //throw new UserInputError("Errors", { errors });
        throw new UserInputError("Errors occcur while approving");
      }
    },

    //delete blog comment
    async deleteBlogComment(parent, args, context, info) {
      const { id } = args;
      try {
        const blogComment = await BlogComment.deleteOne({ _id: id });

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
    newBlogComment: {
      subscribe: (_, __, context) => pubsub.asyncIterator(["NEW_BLOG_COMMENT"]),
    },
  },
};
