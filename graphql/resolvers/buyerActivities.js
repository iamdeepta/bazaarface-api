const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");

const mongoose = require("mongoose");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Product = require("../../models/Product");
const User = require("../../models/User");
const Seller = require("../../models/Seller");
const Buyer = require("../../models/Buyer");
const Category = require("../../models/ProductCategory");
const Quotation = require("../../models/Quotation");
const BuyerActivity = require("../../models/BuyerActivity");

module.exports = {
  Query: {
    //get buyer activities
    async getBuyerActivities(parent, args, context) {
      const { user_id, user_type, limit } = args;

      try {
        var activities = [];
        const activity = await BuyerActivity.aggregate([
          { $match: { user_id: user_id, user_type: user_type } },
          {
            $addFields: {
              visitor_id: { $toObjectId: "$visitor_id" },
              visitors_id: { $toString: "$visitor_id" },
              user_id: { $toObjectId: "$user_id" },
              users_id: { $toString: "$user_id" },
              product_id: { $toObjectId: "$product_id" },
              quotation_id: { $toObjectId: "$quotation_id" },
              ad_id: { $toObjectId: "$ad_id" },
              post_id: { $toObjectId: "$post_id" },
              bid_id: { $toObjectId: "$bid_id" },
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "product_id",
              foreignField: "_id",
              as: "products",
            },
          },
          {
            $lookup: {
              from: "ads",
              localField: "ad_id",
              foreignField: "_id",
              as: "ads",
            },
          },
          {
            $lookup: {
              from: "posts",
              localField: "post_id",
              foreignField: "_id",
              as: "posts",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "visitor_id",
              foreignField: "_id",
              as: "visitor",
            },
          },

          {
            $lookup: {
              from: "sellers",
              localField: "visitors_id",
              foreignField: "user_id",
              as: "sellers",
            },
          },
          {
            $lookup: {
              from: "buyers",
              localField: "visitors_id",
              foreignField: "user_id",
              as: "buyers",
            },
          },
          {
            $lookup: {
              from: "quotations",
              localField: "quotation_id",
              foreignField: "_id",
              as: "quotation",
            },
          },
          {
            $lookup: {
              from: "bids",
              localField: "bid_id",
              foreignField: "_id",
              as: "bid",
            },
          },
        ])
          .sort({ createdAt: -1 })
          .limit(limit);

        var text = "";
        for (var i = 0; i < activity.length; i++) {
          if (activity[i].type === "quotation") {
            text = `You sent a quotation to ${activity[i].users[0].company_name} for product ${activity[i].products[0].name}`;
          }

          if (activity[i].type === "visit_profile") {
            text = `You visited ${activity[i].users[0].company_name}'s profile`;
          }
          if (activity[i].type === "visit_product") {
            text = `You visited ${activity[i].users[0].company_name}'s product ${activity[i].products[0].name}`;
          }
          if (activity[i].type === "bid") {
            text = `You placed bid to ${activity[i].users[0].company_name}'s product ${activity[i].products[0].name}`;
          }
          if (activity[i].type === "ad") {
            text = `You have uploaded an ad for ${activity[i].ads[0].name} product`;
          }
          if (activity[i].type === "comment_post") {
            text = `You have commented on this post: ${activity[i].posts[0].text}`;
          }
          if (activity[i].type === "like_post") {
            text = `You have liked this post: ${activity[i].posts[0].text}`;
          }

          activities.push({
            ...activity[i],
            id: activity[i]._id,
            text: text,
          });
        }
        //console.log(quotations[0].users);
        return activities;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get quotation notifications
    // async getQuotationNotifications(parent, args, context) {
    //   const { user_id, user_type, type, limit } = args;

    //   try {
    //     var notifications = [];
    //     const notification = await Notification.aggregate([
    //       {
    //         $match: {
    //           user_id: user_id,
    //           user_type: user_type,
    //           status: 0,
    //           type: {
    //             $in: [
    //               "received_quotation",
    //               "accepted_quotation",
    //               "rejected_quotation",
    //             ],
    //           },
    //         },
    //       },
    //       {
    //         $addFields: {
    //           visitor_id: { $toObjectId: "$visitor_id" },
    //           visitors_id: { $toString: "$visitor_id" },
    //           user_id: { $toObjectId: "$user_id" },
    //           users_id: { $toString: "$user_id" },
    //           product_id: { $toObjectId: "$product_id" },
    //           quotation_id: { $toObjectId: "$quotation_id" },
    //           bid_id: { $toObjectId: "$bid_id" },
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: "products",
    //           localField: "product_id",
    //           foreignField: "_id",
    //           as: "products",
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: "users",
    //           localField: "visitor_id",
    //           foreignField: "_id",
    //           as: "visitor",
    //         },
    //       },

    //       {
    //         $lookup: {
    //           from: "sellers",
    //           localField: "visitors_id",
    //           foreignField: "user_id",
    //           as: "sellers",
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: "buyers",
    //           localField: "visitors_id",
    //           foreignField: "user_id",
    //           as: "buyers",
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: "quotations",
    //           localField: "quotation_id",
    //           foreignField: "_id",
    //           as: "quotation",
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: "bids",
    //           localField: "bid_id",
    //           foreignField: "_id",
    //           as: "bid",
    //         },
    //       },
    //     ])
    //       .sort({ createdAt: -1 })
    //       .limit(limit);

    //     var text = "";
    //     for (var i = 0; i < notification.length; i++) {
    //       if (notification[i].type === "received_quotation") {
    //         text = `Someone sent a quotation to your product ${notification[i].products[0].name}`;
    //       }
    //       if (notification[i].type === "accepted_quotation") {
    //         text = `Someone accepted a quotation of your product ${notification[i].products[0].name}`;
    //       }
    //       if (notification[i].type === "rejected_quotation") {
    //         text = `Someone rejected a quotation of your product ${notification[i].products[0].name}`;
    //       }

    //       notifications.push({
    //         ...notification[i],
    //         id: notification[i]._id,
    //         text: text,
    //       });
    //     }
    //     //console.log(quotations[0].users);
    //     return notifications;
    //   } catch (err) {
    //     throw new Error(err);
    //   }
    // },

    //get single buyer activity
    async getBuyerActivity(_, { id }, context) {
      try {
        const activity = await BuyerActivity.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(id) } },
          {
            $addFields: {
              visitor_id: { $toObjectId: "$visitor_id" },
              visitors_id: { $toString: "$visitor_id" },
              user_id: { $toObjectId: "$user_id" },
              users_id: { $toString: "$user_id" },
              product_id: { $toObjectId: "$product_id" },
              quotation_id: { $toObjectId: "$quotation_id" },
              ad_id: { $toObjectId: "$ad_id" },
              post_id: { $toObjectId: "$post_id" },
              bid_id: { $toObjectId: "$bid_id" },
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "product_id",
              foreignField: "_id",
              as: "products",
            },
          },
          {
            $lookup: {
              from: "ads",
              localField: "ad_id",
              foreignField: "_id",
              as: "ads",
            },
          },
          {
            $lookup: {
              from: "posts",
              localField: "post_id",
              foreignField: "_id",
              as: "posts",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "visitor_id",
              foreignField: "_id",
              as: "visitor",
            },
          },
          {
            $lookup: {
              from: "sellers",
              localField: "visitors_id",
              foreignField: "user_id",
              as: "sellers",
            },
          },
          {
            $lookup: {
              from: "buyers",
              localField: "visitors_id",
              foreignField: "user_id",
              as: "buyers",
            },
          },
          {
            $lookup: {
              from: "quotations",
              localField: "quotation_id",
              foreignField: "_id",
              as: "quotation",
            },
          },
          {
            $lookup: {
              from: "bids",
              localField: "bid_id",
              foreignField: "_id",
              as: "bid",
            },
          },
        ]);

        var text = "";

        if (activity) {
          if (activity[0].type === "quotation") {
            text = `You sent a quotation to ${activity[0].users[0].company_name} for product ${activity[0].products[0].name}`;
          }

          if (activity[0].type === "visit_profile") {
            text = `You visited ${activity[0].users[0].company_name}'s profile`;
          }
          if (activity[0].type === "visit_product") {
            text = `You visited ${activity[0].users[0].company_name}'s product ${activity[0].products[0].name}`;
          }
          if (activity[0].type === "bid") {
            text = `You placed bid to ${activity[0].users[0].company_name}'s product ${activity[0].products[0].name}`;
          }
          if (activity[0].type === "ad") {
            text = `You have uploaded an ad for ${activity[0].ads[0].name} product`;
          }
          if (activity[0].type === "comment_post") {
            text = `You have commented on this post: ${activity[0].posts[0].text}`;
          }
          if (activity[0].type === "like_post") {
            text = `You have liked this post: ${activity[0].posts[0].text}`;
          }
          //console.log(product[0]);
          return { ...activity[0], id: activity[0]._id, text: text };
        } else {
          throw new Error("Activity not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    //get unseen notification count
    // async getUnseenNotificationCount(parent, args, context) {
    //   const { user_id, user_type } = args;

    //   try {
    //     const notification = await Notification.aggregate([
    //       {
    //         $match: {
    //           user_id: user_id,
    //           user_type: user_type,
    //           seen_status: 0,
    //         },
    //       },
    //     ]);

    //     if (notification) {
    //       const noti_length = notification.length;
    //       //console.log(conversations[0].users);
    //       return noti_length;
    //     }
    //   } catch (err) {
    //     throw new Error(err);
    //   }
    // },
  },

  // Upload: GraphQLUpload,

  Mutation: {
    //create quotation
    async createBuyerActivity(
      _,
      {
        input: {
          visitor_id,
          user_id,
          visitor_user_type,
          user_type,
          product_id,
          ad_id,
          post_id,
          quotation_id,
        },
      },
      context
    ) {
      //const user_check = await checkAuth(context);
      try {
        //if (user_check.isAdmin) {
        if (
          visitor_id.trim() !== "" &&
          user_id.trim() !== "" &&
          visitor_user_type.trim() !== "" &&
          user_type.trim() !== "" &&
          product_id.trim() !== "" &&
          quotation_id.trim() !== "" &&
          ad_id.trim() !== "" &&
          post_id.trim() !== ""
        ) {
          const activity = new BuyerActivity({
            visitor_id,
            user_id,
            visitor_user_type,
            user_type,
            product_id,
            quotation_id,
            ad_id,
            post_id,
          });

          const res = await activity.save();

          return {
            ...res._doc,
            id: res._id,
            message: "Activity is sent.",
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
        throw new UserInputError("Errors occcur while sending activity");
      }
    },

    //update unseen notification count
    // async updateUnseenNotificationCount(parent, args, context) {
    //   const { user_id, user_type } = args;

    //   try {
    //     const seen_noti = await Notification.updateMany(
    //       { user_id: user_id, user_type: user_type },
    //       {
    //         $set: { seen_status: 1 },
    //       },
    //       { new: true }
    //     );

    //     if (seen_noti) {
    //       const noti_length = seen_noti.length;
    //       //console.log(conversations[0].users);
    //       return noti_length;
    //     }
    //   } catch (err) {
    //     throw new Error(err);
    //   }
    // },

    //delete notification
    async deleteBuyerActivity(parent, args, context) {
      const { id } = args;

      try {
        const noti = await BuyerActivity.findByIdAndDelete(id);

        if (noti) {
          //console.log(conversations[0].users);
          return { message: "Activity is deleted", success: true };
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
