const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");
const BlogImageResolver = require("./blog_image_resolvers");
const mongoose = require("mongoose");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Product = require("../../models/Product");
const User = require("../../models/User");
const Seller = require("../../models/Seller");
const Buyer = require("../../models/Buyer");
const Category = require("../../models/ProductCategory");
const Notifications = require("../../models/Notification");
const Blog = require("../../models/Blog");
const BuyerActivities = require("../../models/BuyerActivity");

module.exports = {
  Query: {
    //get blogs
    async getBlogs(parent, args, context) {
      //const { user_id, user_type, seller_id, buyer_id } = args;

      try {
        var blogs = [];
        const blog = await Blog.find().sort({ createdAt: -1 });

        for (var i = 0; i < blog.length; i++) {
          //get users name and pic who like the post
          var likes = [];
          for (var j = 0; j < blog[i].likes.length; j++) {
            const user = await User.findById(blog[i].likes[j].user_id);
            if (blog[i].likes[j].user_type === "Seller") {
              const seller = await Seller.find({
                user_id: blog[i].likes[j].user_id,
              });
              likes.push({
                like_name: user.company_name,
                like_image: seller[0].profile_image,
              });
            } else {
              const buyer = await Buyer.find({
                user_id: blog[i].likes[j].user_id,
              });
              likes.push({
                like_name: user.firstname + " " + user.lastname,
                like_image: buyer[0].profile_image,
              });
            }
          }
          //console.log(likes);
          blogs.push({
            ...blog[i]._doc,
            id: blog[i]._id,
            totalLikes: blog[i].likes.length,
            likes: likes,
          });
        }
        //console.log(posts);
        return blogs;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get single blog
    async getBlog(_, { id }, context) {
      try {
        const blog = await Blog.findById(id);

        //get users name and pic who like the post
        var likes = [];
        for (var j = 0; j < blog.likes.length; j++) {
          const user = await User.findById(blog.likes[j].user_id);
          if (blog.likes[j].user_type === "Seller") {
            const seller = await Seller.find({
              user_id: blog.likes[j].user_id,
            });
            likes.push({
              like_name: user.company_name,
              like_image: seller[0].profile_image,
            });
          } else {
            const buyer = await Buyer.find({
              user_id: blog.likes[j].user_id,
            });
            likes.push({
              like_name: user.firstname + " " + user.lastname,
              like_image: buyer[0].profile_image,
            });
          }
        }

        if (blog) {
          //console.log(product[0]);
          return {
            ...blog._doc,
            id: blog._id,
            totalLikes: blog.likes.length,
            likes: likes,
          };
        } else {
          throw new Error("Blog not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  // Upload: GraphQLUpload,

  Mutation: {
    //create blog
    createBlog: (
      _,
      { input: { title, description, category, time, files, bucketName } }
    ) =>
      new BlogImageResolver().createBlog(
        title,
        description,
        category,
        time,
        files,
        bucketName
      ),

    //update blog
    async updateBlog(parent, args, context, info) {
      const { id } = args;
      const { title, description, category, time } = args.input;

      const updates = {};

      if (title !== undefined) {
        updates.title = title;
      }
      if (description !== undefined) {
        updates.description = description;
      }
      if (category !== undefined) {
        updates.category = category;
      }
      if (time !== undefined) {
        updates.time = time;
      }

      // TODO: Make sure user doesnt already exist
      try {
        // if (user_check.isAdmin) {
        const blog = await Blog.findByIdAndUpdate(
          id,
          {
            $set: updates,
          },
          { new: true }
        );
        return {
          ...blog._doc,
          id: blog._id,
          message: "Blog is updated successfully.",
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

    //update blog image
    updateBlogImage: (_, { id, pic_name, file, bucketName }) =>
      new BlogImageResolver().updateBlogImage(id, pic_name, file, bucketName),

    //delete blog image
    deleteBlogImage: (_, { id, pic_name, bucketName }) =>
      new BlogImageResolver().deleteBlogImage(id, pic_name, bucketName),

    //add blog like
    async addBlogLike(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id, user_id, user_type } = args;

      // TODO: Make sure user doesnt already exist
      try {
        const blog_likes = await Blog.findById(id);
        //check if an object is present in array
        const isFound = blog_likes.likes.some((element) => {
          if (element.user_id === user_id && element.user_type === user_type) {
            return true;
          }

          return false;
        });

        // if (user_check.isAdmin) {
        if (isFound === false) {
          const blog = await Blog.findByIdAndUpdate(
            id,
            {
              $push: {
                likes: { $each: [{ user_id, user_type }], $position: 0 },
              },
            },
            { new: true }
          );

          if (blog && user_type === "Buyer") {
            //send activity

            var blog_id = blog._id.toString();
            const activity = new BuyerActivities({
              type: "like_blog",
              user_id: user_id,
              user_type: user_type,
              blog_id: blog_id,
              text: "You liked a blog",
            });

            const res_activity = await activity.save();
          }

          return {
            ...blog._doc,
            message: "You liked this blog.",
            success: true,
          };
        } else {
          const blog = await Blog.findByIdAndUpdate(
            id,
            {
              $pull: {
                likes: { user_id, user_type },
              },
            },
            { new: true }
          );

          return {
            ...blog._doc,
            message: "You unliked this blog.",
            success: true,
          };
        }
        // } else {
        //   throw new AuthenticationError("Action not allowed");
        // }
      } catch (err) {
        //throw new UserInputError("Errors", { errors });
        throw new UserInputError("Errors occcur while liking blog");
      }
    },
  },
};
