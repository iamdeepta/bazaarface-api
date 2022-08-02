const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");
const SellerImageResolver = require("./seller_image_resolvers");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Seller = require("../../models/Seller");
const Buyer = require("../../models/Buyer");
const User = require("../../models/User");
const Notifications = require("../../models/Notification");
const BuyerActivities = require("../../models/BuyerActivity");

module.exports = {
  Query: {
    async getSellers(parent, args, context) {
      try {
        const seller = await Seller.find().sort({
          createdAt: -1,
        });

        return seller;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getSeller(_, { id }, context) {
      const user_check = await checkAuth(context);
      try {
        const seller = await Seller.findOne({ user_id: id });
        if (seller) {
          if (user_check.id !== id) {
            const notification = new Notifications({
              type: "visited",
              visitor_id: user_check.id,
              user_id: seller.user_id,
              visitor_user_type: "Buyer",
              user_type: "Seller",
              text: "Someone visited your profile",
            });

            const res_noti = await notification.save();

            //send activity
            const activity = new BuyerActivities({
              type: "visit_profile",
              visitor_id: seller.user_id,
              user_id: user_check.id,
              visitor_user_type: "Seller",
              user_type: "Buyer",
              text: "You visited a profile",
            });

            const res_activity = await activity.save();
          }
          return seller;
        } else {
          throw new Error("Seller not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    async getSellerFollowersList(_, { id }, context) {
      try {
        const seller = await Seller.findOne({ user_id: id });

        if (seller) {
          var followers = [];

          for (var i = 0; i < seller.followers.length; i++) {
            const sellers = await Seller.findById(seller.followers[i]);
            const users = await User.findById(sellers.user_id);
            //console.log(users);
            followers.push({
              name: users.company_name,
              profile_image: sellers.profile_image,
            });
          }
          return followers;
        } else {
          throw new Error("You have no followers");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    //get total sellers
    async getTotalSeller(parent, data, context) {
      const user = await checkAuth(context);
      try {
        const sellers = await Seller.find();
        if (user.isAdmin) {
          return sellers.length;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  // Upload: GraphQLUpload,

  Mutation: {
    //update seller description
    async updateSellerDescription(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id } = args;
      const { description } = args.input;

      const updates = {};

      if (description !== undefined) {
        updates.description = description;
      } else {
        return {
          message: "Description must not be empty.",
          success: true,
        };
      }

      // TODO: Make sure user doesnt already exist
      try {
        //if (user_check.isAdmin) {
        const des = await Seller.findOneAndUpdate(
          { user_id: id },
          {
            $set: updates,
          },
          { new: true }
        );
        return {
          ...des._doc,
          id: des._id,
          message: "Description is updated successfully.",
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

    //update seller key facts
    async updateKeyFact(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id } = args;
      const { founded, employees, revenue, production, machinery } = args.input;

      const updates = {};

      if (founded !== undefined) {
        updates.founded = founded;
      }

      if (employees !== undefined) {
        updates.employees = employees;
      }

      if (revenue !== undefined) {
        updates.revenue = revenue;
      }

      if (production !== undefined) {
        updates.production = production;
      }

      if (machinery !== undefined) {
        updates.machinery = machinery;
      }

      // TODO: Make sure user doesnt already exist
      try {
        // if (user_check.isAdmin) {
        const keyfact = await Seller.findOneAndUpdate(
          { user_id: id },
          {
            $set: { key_facts: updates },
          },
          { new: true }
        );
        return {
          ...keyfact._doc.key_facts,
          message: "Key fact is updated successfully.",
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

    //upload profile image
    uploadSellerProPic: (_, { id, file, bucketName }) =>
      new SellerImageResolver().uploadSellerProPic(id, file, bucketName),

    //upload cover image
    uploadSellerCoverPic: (_, { id, file, bucketName }) =>
      new SellerImageResolver().uploadSellerCoverPic(id, file, bucketName),

    //upload reference customers image
    uploadSellerRefCustomersImage: (_, { id, files, bucketName }) =>
      new SellerImageResolver().uploadSellerRefCustomersImage(
        id,
        files,
        bucketName
      ),

    //update reference customers image
    updateSellerRefCustomersImage: (_, { id, pic_name, file, bucketName }) =>
      new SellerImageResolver().updateSellerRefCustomersImage(
        id,
        pic_name,
        file,
        bucketName
      ),

    //delete reference customers image
    deleteSellerRefCustomersImage: (_, { id, pic_name, bucketName }) =>
      new SellerImageResolver().deleteSellerRefCustomersImage(
        id,
        pic_name,
        bucketName
      ),

    //update seller followers
    async updateSellerFollowers(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id, follow_id, user_id } = args;
      //const { description } = args.input;

      // TODO: Make sure user doesnt already exist
      try {
        if (user_check.id === user_id) {
          const find_seller = await Seller.findOne({ _id: id });
          var des;

          if (find_seller) {
            des = await Seller.findByIdAndUpdate(
              id,
              {
                $push: { followers: { $each: [follow_id], $position: 0 } },
                $inc: { total_followers: 1 },
              },

              { new: true }
            );
          } else {
            des = await Buyer.findByIdAndUpdate(
              id,
              {
                $push: { followers: { $each: [follow_id], $position: 0 } },
                $inc: { total_followers: 1 },
              },

              { new: true }
            );
          }

          const following = await Seller.findByIdAndUpdate(
            follow_id,
            {
              $push: { following: { $each: [id], $position: 0 } },
              $inc: { total_following: 1 },
            },

            { new: true }
          );

          return {
            ...des._doc,
            id: des._id,
            message: "You are now following this user.",
            success: true,
          };
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        //throw new UserInputError("Errors", { errors });
        throw new UserInputError("Errors occcur while following");
      }
    },

    //update seller unfollow
    async updateSellerUnfollow(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id, follow_id, user_id } = args;
      //const { description } = args.input;

      // TODO: Make sure user doesnt already exist
      try {
        if (user_check.id === user_id) {
          const find_seller = await Seller.findOne({ _id: id });
          var des;

          if (find_seller) {
            des = await Seller.findByIdAndUpdate(
              id,
              {
                $pull: { followers: follow_id },
                $inc: { total_followers: -1 },
              },

              { new: true }
            );
          } else {
            des = await Buyer.findByIdAndUpdate(
              id,
              {
                $pull: { followers: follow_id },
                $inc: { total_followers: -1 },
              },

              { new: true }
            );
          }

          const following = await Seller.findByIdAndUpdate(
            follow_id,
            {
              $pull: { following: id },
              $inc: { total_following: -1 },
            },

            { new: true }
          );

          return {
            ...des._doc,
            id: des._id,
            message: "You unfollowed this user.",
            success: true,
          };
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        //throw new UserInputError("Errors", { errors });
        throw new UserInputError("Errors occcur while unfollowing");
      }
    },

    //add followers
    async addFollowers(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { user_id, user_type, receiver_id, receiver_user_type } = args;

      // TODO: Make sure user doesnt already exist
      try {
        if (receiver_user_type === "Seller") {
          const sellers = await Seller.findOne({
            user_id: receiver_id,
            user_type: receiver_user_type,
          });
          //check if an object is present in array
          const isFound = sellers.followers.some((element) => {
            if (
              element.user_id === user_id &&
              element.user_type === user_type
            ) {
              return true;
            }

            return false;
          });

          // if (user_check.isAdmin) {
          if (isFound === false) {
            const seller = await Seller.findOneAndUpdate(
              { user_id: receiver_id, user_type: receiver_user_type },
              {
                $push: {
                  followers: { $each: [{ user_id, user_type }], $position: 0 },
                },
              },
              { new: true }
            );

            if (user_type === "Seller") {
              const followings = await Seller.findOneAndUpdate(
                { user_id, user_type },
                {
                  $push: {
                    following: {
                      $each: [
                        { user_id: receiver_id, user_type: receiver_user_type },
                      ],
                      $position: 0,
                    },
                  },
                },
                { new: true }
              );
            } else {
              const followings = await Buyer.findOneAndUpdate(
                { user_id, user_type },
                {
                  $push: {
                    following: {
                      $each: [
                        { user_id: receiver_id, user_type: receiver_user_type },
                      ],
                      $position: 0,
                    },
                  },
                },
                { new: true }
              );
            }

            // if (seller && user_type === "Buyer") {
            //   //send activity
            //   if (user_check.id !== post.user_id) {
            //     var post_id = post._id.toString();
            //     const activity = new BuyerActivities({
            //       type: "like_post",
            //       visitor_id: post.user_id,
            //       user_id: user_id,
            //       visitor_user_type: post.user_type,
            //       user_type: user_type,
            //       post_id: post_id,
            //       text: "You liked a post",
            //     });

            //     const res_activity = await activity.save();
            //   }
            // }

            return {
              ...seller._doc,
              message: "You followed this user.",
              success: true,
            };
          } else {
            const seller = await Seller.findOneAndUpdate(
              { user_id: receiver_id, user_type: receiver_user_type },
              {
                $pull: {
                  followers: { user_id, user_type },
                },
              },
              { new: true }
            );

            if (user_type === "Seller") {
              const followings = await Seller.findOneAndUpdate(
                { user_id, user_type },
                {
                  $pull: {
                    following: {
                      user_id: receiver_id,
                      user_type: receiver_user_type,
                    },
                  },
                },
                { new: true }
              );
            } else {
              const followings = await Buyer.findOneAndUpdate(
                { user_id, user_type },
                {
                  $pull: {
                    following: {
                      user_id: receiver_id,
                      user_type: receiver_user_type,
                    },
                  },
                },
                { new: true }
              );
            }

            // if (seller && user_type === "Buyer") {
            //   //send activity
            //   if (user_check.id !== post.user_id) {
            //     var post_id = post._id.toString();
            //     const activity = new BuyerActivities({
            //       type: "like_post",
            //       visitor_id: post.user_id,
            //       user_id: user_id,
            //       visitor_user_type: post.user_type,
            //       user_type: user_type,
            //       post_id: post_id,
            //       text: "You liked a post",
            //     });

            //     const res_activity = await activity.save();
            //   }
            // }

            return {
              ...seller._doc,
              message: "You unfollowed this user.",
              success: true,
            };
            // const seller = await Seller.findOneAndUpdate(
            //   { user_id: receiver_id, user_type: receiver_user_type },
            //   {
            //     $pull: {
            //       followers: { user_id, user_type },
            //     },
            //   },
            //   { new: true }
            // );
            // return {
            //   ...seller._doc,
            //   message: "You disliked this post.",
            //   success: true,
            // };
          }
        } else {
          // for buyer followers

          const buyers = await Buyer.findOne({
            user_id: receiver_id,
            user_type: receiver_user_type,
          });
          //check if an object is present in array
          const isFound = buyers.followers.some((element) => {
            if (
              element.user_id === user_id &&
              element.user_type === user_type
            ) {
              return true;
            }

            return false;
          });

          // if (user_check.isAdmin) {
          if (isFound === false) {
            const buyer = await Buyer.findOneAndUpdate(
              { user_id: receiver_id, user_type: receiver_user_type },
              {
                $push: {
                  followers: { $each: [{ user_id, user_type }], $position: 0 },
                },
              },
              { new: true }
            );

            if (user_type === "Seller") {
              const followings = await Seller.findOneAndUpdate(
                { user_id, user_type },
                {
                  $push: {
                    following: {
                      $each: [
                        { user_id: receiver_id, user_type: receiver_user_type },
                      ],
                      $position: 0,
                    },
                  },
                },
                { new: true }
              );
            } else {
              const followings = await Buyer.findOneAndUpdate(
                { user_id, user_type },
                {
                  $push: {
                    following: {
                      $each: [
                        { user_id: receiver_id, user_type: receiver_user_type },
                      ],
                      $position: 0,
                    },
                  },
                },
                { new: true }
              );
            }

            // if (seller && user_type === "Buyer") {
            //   //send activity
            //   if (user_check.id !== post.user_id) {
            //     var post_id = post._id.toString();
            //     const activity = new BuyerActivities({
            //       type: "like_post",
            //       visitor_id: post.user_id,
            //       user_id: user_id,
            //       visitor_user_type: post.user_type,
            //       user_type: user_type,
            //       post_id: post_id,
            //       text: "You liked a post",
            //     });

            //     const res_activity = await activity.save();
            //   }
            // }

            return {
              ...buyer._doc,
              message: "You followed this user.",
              success: true,
            };
          } else {
            const buyer = await Buyer.findOneAndUpdate(
              { user_id: receiver_id, user_type: receiver_user_type },
              {
                $pull: {
                  followers: { user_id, user_type },
                },
              },
              { new: true }
            );

            if (user_type === "Seller") {
              const followings = await Seller.findOneAndUpdate(
                { user_id, user_type },
                {
                  $pull: {
                    following: {
                      user_id: receiver_id,
                      user_type: receiver_user_type,
                    },
                  },
                },
                { new: true }
              );
            } else {
              const followings = await Buyer.findOneAndUpdate(
                { user_id, user_type },
                {
                  $pull: {
                    following: {
                      user_id: receiver_id,
                      user_type: receiver_user_type,
                    },
                  },
                },
                { new: true }
              );
            }

            // if (seller && user_type === "Buyer") {
            //   //send activity
            //   if (user_check.id !== post.user_id) {
            //     var post_id = post._id.toString();
            //     const activity = new BuyerActivities({
            //       type: "like_post",
            //       visitor_id: post.user_id,
            //       user_id: user_id,
            //       visitor_user_type: post.user_type,
            //       user_type: user_type,
            //       post_id: post_id,
            //       text: "You liked a post",
            //     });

            //     const res_activity = await activity.save();
            //   }
            // }

            return {
              ...buyer._doc,
              message: "You unfollowed this user.",
              success: true,
            };
            // const seller = await Seller.findOneAndUpdate(
            //   { user_id: receiver_id, user_type: receiver_user_type },
            //   {
            //     $pull: {
            //       followers: { user_id, user_type },
            //     },
            //   },
            //   { new: true }
            // );
            // return {
            //   ...seller._doc,
            //   message: "You disliked this post.",
            //   success: true,
            // };
          }
        }
        // } else {
        //   throw new AuthenticationError("Action not allowed");
        // }
      } catch (err) {
        //throw new UserInputError("Errors", { errors });
        throw new UserInputError("Errors occcur while following user");
      }
    },
  },
};
