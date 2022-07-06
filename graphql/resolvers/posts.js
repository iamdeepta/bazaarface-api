const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");
const PostImageResolver = require("./post_image_resolvers");
const mongoose = require("mongoose");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Product = require("../../models/Product");
const User = require("../../models/User");
const Seller = require("../../models/Seller");
const Buyer = require("../../models/Buyer");
const Category = require("../../models/ProductCategory");
const Notifications = require("../../models/Notification");
const Post = require("../../models/Post");

module.exports = {
  Query: {
    //get posts
    async getPosts(parent, args, context) {
      const { user_id, user_type, seller_id, buyer_id } = args;

      var following_user_id = [user_id];
      var following_user_type = [user_type];
      //   console.log(following_user_type.includes("as"));

      //fetching following users for displaying their posts
      if (user_type === "Seller") {
        const seller = await Seller.findOne({ user_id: user_id });
        for (var i = 0; i < seller.following.length; i++) {
          const seller_others = await Seller.findById(seller.following[i]);
          if (seller_others.user_id !== user_id) {
            following_user_id.push(seller_others.user_id);
            //check if user type is already in an array
            if (!following_user_type.includes(seller_others.user_type)) {
              following_user_type.push(seller_others.user_type);
            }
          }
        }
      } else {
        const buyer = await Buyer.findOne({ user_id: user_id });
        for (var i = 0; i < buyer.following.length; i++) {
          const buyer_others = await Buyer.findById(buyer.following[i]);
          if (buyer_others.user_id !== user_id) {
            following_user_id.push(buyer_others.user_id);
            //check if user type is already in an array
            if (!following_user_type.includes(buyer_others.user_type)) {
              following_user_type.push(seller_others.user_type);
            }
          }
        }
      }

      var updates = {};

      if (user_id !== undefined) {
        //updates.user_id = user_id;
        updates.user_id = { $in: following_user_id };
      }
      if (user_type !== undefined) {
        //updates.user_type = user_type;
        updates.user_type = { $in: following_user_type };
      }
      if (seller_id !== undefined) {
        updates.seller_id = seller_id;
      }
      if (buyer_id !== undefined) {
        updates.buyer_id = buyer_id;
      }

      //   if (
      //     country_id !== undefined &&
      //     country_id !== null &&
      //     country_id.length !== 0
      //   ) {
      //     updates.country = { $in: country_id };
      //   }
      try {
        var posts = [];
        const post = await Post.aggregate([
          { $match: updates },
          {
            $addFields: {
              user_id: { $toObjectId: "$user_id" },
              users_id: { $toString: "$user_id" },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "users",
            },
          },

          {
            $lookup: {
              from: "sellers",
              localField: "users_id",
              foreignField: "user_id",
              as: "sellers",
            },
          },
          {
            $lookup: {
              from: "buyers",
              localField: "users_id",
              foreignField: "user_id",
              as: "buyers",
            },
          },
        ]).sort({ createdAt: -1 });

        for (var i = 0; i < post.length; i++) {
          posts.push({
            ...post[i],
            id: post[i]._id,
            totalLikes: post[i].likes.length,
          });
        }
        //console.log(products);
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get single post
    async getPost(_, { id }, context) {
      try {
        const post = await Post.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(id) } },
          {
            $addFields: {
              user_id: { $toObjectId: "$user_id" },
              users_id: { $toString: "$user_id" },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "users",
            },
          },
          {
            $lookup: {
              from: "sellers",
              localField: "users_id",
              foreignField: "user_id",
              as: "sellers",
            },
          },
          {
            $lookup: {
              from: "buyers",
              localField: "users_id",
              foreignField: "user_id",
              as: "buyers",
            },
          },
        ]);

        if (post) {
          //console.log(product[0]);
          return {
            ...post[0],
            id: post[0]._id,
            totalLikes: post[0].likes.length,
          };
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  // Upload: GraphQLUpload,

  Mutation: {
    //create post
    createPost: (
      _,
      {
        input: {
          user_id,
          user_type,
          seller_id,
          buyer_id,
          text,
          files,
          bucketName,
        },
      }
    ) =>
      new PostImageResolver().createPost(
        user_id,
        user_type,
        seller_id,
        buyer_id,
        text,
        files,
        bucketName
      ),

    //update post
    async updatePost(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id } = args;
      const { text } = args.input;

      const updates = {};

      if (text !== undefined) {
        updates.text = text;
      }

      // TODO: Make sure user doesnt already exist
      try {
        // if (user_check.isAdmin) {
        const post = await Post.findByIdAndUpdate(
          id,
          {
            $set: updates,
          },
          { new: true }
        );
        return {
          ...post._doc,
          message: "Post is updated successfully.",
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

    //update post image
    updatePostImage: (_, { id, pic_name, file, bucketName }) =>
      new PostImageResolver().updatePostImage(id, pic_name, file, bucketName),

    //delete post image
    deletePostImage: (_, { id, pic_name, bucketName }) =>
      new PostImageResolver().deletePostImage(id, pic_name, bucketName),

    //add post like
    async addPostLike(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id, user_id, user_type } = args;

      // TODO: Make sure user doesnt already exist
      try {
        const post_likes = await Post.findById(id);
        //check if an object is present in array
        const isFound = post_likes.likes.some((element) => {
          if (element.user_id === user_id && element.user_type === user_type) {
            return true;
          }

          return false;
        });

        // if (user_check.isAdmin) {
        if (isFound === false) {
          const post = await Post.findByIdAndUpdate(
            id,
            {
              $push: {
                likes: { $each: [{ user_id, user_type }], $position: 0 },
              },
            },
            { new: true }
          );
          return {
            ...post._doc,
            message: "You liked this post.",
            success: true,
          };
        } else {
          const post = await Post.findByIdAndUpdate(
            id,
            {
              $pull: {
                likes: { user_id, user_type },
              },
            },
            { new: true }
          );
          return {
            ...post._doc,
            message: "You unliked this post.",
            success: true,
          };
        }
        // } else {
        //   throw new AuthenticationError("Action not allowed");
        // }
      } catch (err) {
        //throw new UserInputError("Errors", { errors });
        throw new UserInputError("Errors occcur while liking post");
      }
    },
  },
};
