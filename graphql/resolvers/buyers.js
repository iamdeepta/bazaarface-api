const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");
const BuyerImageResolver = require("./buyer_image_resolvers");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Buyer = require("../../models/Buyer");
const Seller = require("../../models/Seller");
const User = require("../../models/User");
const Country = require("../../models/Country");
const Notifications = require("../../models/Notification");
const { update } = require("../../models/User");

module.exports = {
  Query: {
    async getBuyers(parent, args, context) {
      try {
        var buyers = [];
        const buyer = await Buyer.aggregate([
          {
            $addFields: {
              user_id: { $toObjectId: "$user_id" },
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
        ]).sort({ createdAt: -1 });

        for (var i = 0; i < buyer.length; i++) {
          const country = await Country.findOne({
            _id: buyer[i].users[0].country,
          });
          buyers.push({
            ...buyer[i],
            id: buyer[i]._id,
            country: country.name,
          });
        }
        //console.log(buyers);
        return buyers;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getBuyer(_, { id }, context) {
      const user_check = await checkAuth(context);
      try {
        if (user_check.isAdmin || !user_check.isAdmin) {
          const buyer = await Buyer.aggregate([
            { $match: { user_id: id } },
            {
              $addFields: {
                user_id: { $toObjectId: "$user_id" },
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
          ]);

          const country = await Country.findOne({
            _id: buyer[0].users[0].country,
          });
          if (buyer) {
            if (user_check.id !== id) {
              const notification = new Notifications({
                type: "visited",
                visitor_id: user_check.id,
                user_id: buyer[0].user_id,
                visitor_user_type: user_check.user_type,
                user_type: "Buyer",
                text: "Someone visited your profile",
              });

              const res_noti = await notification.save();
            }
            return { ...buyer[0], id: buyer[0]._id, country: country.name };
          } else {
            throw new Error("Buyer not found");
          }
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    //get buyer follwers list
    async getBuyerFollowersList(_, { id }, context) {
      try {
        const buyer = await Buyer.findOne({ user_id: id });

        if (buyer) {
          var followers = [];

          for (var i = 0; i < buyer.followers.length; i++) {
            const buyers = await Buyer.findById(buyer.followers[i]);
            const users = await User.findById(buyers.user_id);

            //console.log(users);
            followers.push({
              name: users.firstname,
              profile_image: buyers.profile_image,
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

    //get single work history
    async getWorkHistory(parent, args, context) {
      try {
        const wh = await Buyer.findOne({
          user_id: args.id,

          //   "work_history.work_history_id": args.work_history_id,
        });

        const single_work_history = wh.work_history.filter(
          (item) => item.work_history_id === args.work_history_id
        );

        return {
          ...single_work_history[0],
          id: single_work_history[0].work_history_id,
        };
      } catch (err) {
        throw new Error(err);
      }
    },

    //get total buyers
    async getTotalBuyer(parent, data, context) {
      const user = await checkAuth(context);
      try {
        const buyers = await Buyer.find();
        if (user.isAdmin) {
          return buyers.length;
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
    //update buyer description
    async updateBuyerDescription(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id } = args;
      const { description, firstname, lastname, country, designation, city } =
        args.input;

      const updates = {};
      const updates_for_user = {};

      if (description !== undefined) {
        updates.description = description;
      }

      if (designation !== undefined) {
        updates.designation = designation;
      }

      if (firstname !== undefined) {
        updates_for_user.firstname = firstname;
      }

      if (lastname !== undefined) {
        updates_for_user.lastname = lastname;
      }

      if (country !== undefined) {
        updates_for_user.country = country;
      }

      if (city !== undefined) {
        updates_for_user.city = city;
      }

      // TODO: Make sure user doesnt already exist
      try {
        //if (user_check.isAdmin) {
        const des = await Buyer.findOneAndUpdate(
          { user_id: id },
          {
            $set: updates,
          },
          { new: true }
        );

        const user = await User.findOneAndUpdate(
          { _id: id },
          {
            $set: updates_for_user,
          },
          { new: true }
        );
        return {
          ...des._doc,
          id: des._id,
          message: "Updated successfully.",
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

    //create buyer work history
    async createWorkHistory(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id } = args;
      const { work_history_id, designation, location, year_range } = args.input;
      let timestamp = new Date().getTime().toString();
      const updates = {};

      if (
        work_history_id !== "" &&
        designation !== "" &&
        location !== "" &&
        year_range !== ""
      ) {
        updates.work_history_id = timestamp;
        updates.designation = designation;
        updates.location = location;
        updates.year_range = year_range;
      } else {
        return {
          message: "Please fill up all the fields.",
          success: false,
        };
      }

      // TODO: Make sure user doesnt already exist
      try {
        // if (user_check.isAdmin) {
        const buyer = await Buyer.findOneAndUpdate(
          { user_id: id },
          {
            $push: {
              work_history: {
                $each: [updates],
                $position: 0,
              },
            },
          },
          { new: true }
        );
        return {
          //   ...buyer._doc.work_history,
          message: "Work history is added successfully.",
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

    //update work history
    async updateWorkHistory(parent, args, context, info) {
      //const user_check = await checkAuth(context);
      const { id } = args;
      const { work_history_id, designation, location, year_range } = args.input;

      var updates = {};

      if (designation !== "" && location !== "" && year_range !== "") {
        updates.work_history_id = work_history_id;
        updates.designation = designation;
        updates.location = location;
        updates.year_range = year_range;
      } else {
        return {
          message: "Please fill up all the fields",
          success: false,
        };
      }
      // TODO: Make sure user doesnt already exist
      try {
        //if (user_check.id === id) {
        const buyer_up = await Buyer.updateOne(
          { user_id: id, "work_history.work_history_id": work_history_id },
          {
            $set: { "work_history.$": updates },
          },
          { new: true }
        );

        return {
          message: "Updated successfully.",
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

    //delete work history
    async deleteWorkHistory(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id, work_history_id } = args;

      // TODO: Make sure user doesnt already exist
      try {
        if (user_check.id === id) {
          const wh = await Buyer.findOneAndUpdate(
            { user_id: id },
            {
              $pull: { work_history: { work_history_id: work_history_id } },
            },

            { new: true }
          );

          return {
            message: "Deleted successfully.",
            success: true,
          };
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        //throw new UserInputError("Errors", { errors });
        throw new UserInputError("Errors occcur while deleting");
      }
    },

    //upload profile image
    uploadBuyerProPic: (_, { id, file, bucketName }) =>
      new BuyerImageResolver().uploadBuyerProPic(id, file, bucketName),

    //upload cover image
    uploadBuyerCoverPic: (_, { id, file, bucketName }) =>
      new BuyerImageResolver().uploadBuyerCoverPic(id, file, bucketName),

    //update buyer followers
    async updateBuyerFollowers(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id, follow_id, user_id } = args;
      //const { description } = args.input;

      // TODO: Make sure user doesnt already exist
      try {
        if (user_check.id === user_id) {
          const find_buyer = await Buyer.findOne({ _id: id });
          var des;
          if (find_buyer) {
            des = await Buyer.findByIdAndUpdate(
              id,
              {
                $push: { followers: { $each: [follow_id], $position: 0 } },
                $inc: { total_followers: 1 },
              },

              { new: true }
            );
          } else {
            des = await Seller.findByIdAndUpdate(
              id,
              {
                $push: {
                  followers: { $each: [follow_id], $position: 0 },
                },
                $inc: { total_followers: 1 },
              },

              { new: true }
            );
          }

          const following = await Buyer.findByIdAndUpdate(
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

    //update buyer unfollow
    async updateBuyerUnfollow(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id, follow_id, user_id } = args;
      //const { description } = args.input;

      // TODO: Make sure user doesnt already exist
      try {
        if (user_check.id === user_id) {
          const find_buyer = await Buyer.findOne({ _id: id });
          var des;
          if (find_buyer) {
            des = await Buyer.findByIdAndUpdate(
              id,
              {
                $pull: { followers: follow_id },
                $inc: { total_followers: -1 },
              },

              { new: true }
            );
          } else {
            des = await Seller.findByIdAndUpdate(
              id,
              {
                $pull: { followers: follow_id },
                $inc: { total_followers: -1 },
              },

              { new: true }
            );
          }

          const following = await Buyer.findByIdAndUpdate(
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
  },
};
