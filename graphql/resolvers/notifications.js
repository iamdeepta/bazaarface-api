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
const Notification = require("../../models/Notification");

module.exports = {
  Query: {
    //get notifications
    async getNotifications(parent, args, context) {
      const { user_id, user_type, limit } = args;

      try {
        var notifications = [];
        const notification = await Notification.aggregate([
          { $match: { user_id: user_id, user_type: user_type, status: 0 } },
          {
            $addFields: {
              visitor_id: { $toObjectId: "$visitor_id" },
              visitors_id: { $toString: "$visitor_id" },
              user_id: { $toObjectId: "$user_id" },
              users_id: { $toString: "$user_id" },
              product_id: { $toObjectId: "$product_id" },
              ad_id: { $toObjectId: "$ad_id" },
              blog_id: { $toObjectId: "$blog_id" },
              quotation_id: { $toObjectId: "$quotation_id" },
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
              from: "blogs",
              localField: "blog_id",
              foreignField: "_id",
              as: "blogs",
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

        //console.log(notification);

        var text = "";
        var today_date = new Date().getTime();
        for (var i = 0; i < notification.length; i++) {
          var noti_date = new Date(notification[i].createdAt).getTime();
          var difference_of_date =
            (today_date - noti_date) / (1000 * 3600 * 24);

          if (difference_of_date < 1) {
            if (notification[i].type === "received_quotation") {
              if (notification[i].quotation[0].isAd) {
                text = `Someone sent a quotation to your ad ${notification[i].ads[0].name}`;
              } else {
                text = `Someone sent a quotation to your product ${notification[i].products[0].name}`;
              }
            }
            if (notification[i].type === "accepted_quotation") {
              if (notification[i].quotation[0].isAd) {
                text = `Someone accepted a quotation of your ad ${notification[i].ads[0].name}`;
              } else {
                text = `Someone accepted a quotation of your product ${notification[i].products[0].name}`;
              }
            }
            if (notification[i].type === "rejected_quotation") {
              if (notification[i].quotation[0].isAd) {
                text = `Someone rejected a quotation of your ad ${notification[i].ads[0].name}`;
              } else {
                text = `Someone rejected a quotation of your product ${notification[i].products[0].name}`;
              }
            }
            if (notification[i].type === "visited") {
              if (notification[i].visitor[0].user_type === "Buyer") {
                text = `A buyer from ${notification[i].visitor[0].city} visited your profile`;
              } else {
                text = `A seller from ${notification[i].visitor[0].city} visited your profile`;
              }
            }
            if (notification[i].type === "placed_bid") {
              if (notification[i].visitor[0].user_type === "Buyer") {
                text = `A buyer placed bid to your product ${notification[i].products[0].name}`;
              } else {
                text = `A seller placed bid to your product ${notification[i].products[0].name}`;
              }
            }
            if (notification[i].type === "uploaded_to_marketplace") {
              text = `${notification[i].visitor[0].company_name} uploaded a new product to marketplace`;
            }
            if (notification[i].type === "uploaded_to_auction") {
              text = `${notification[i].visitor[0].company_name} uploaded a new product to auction`;
            }
            if (notification[i].type === "ending_seller_auction") {
              text = `Your product ${notification[i].products[0].name} in auction is about to end in 12 hours`;
            }
            if (notification[i].type === "approve_blog_comment") {
              text = `Your comment on this blog:  ${notification[i].blogs[0].title} got approved`;
            }
            notifications.push({
              ...notification[i],
              id: notification[i]._id,
              text: text,
            });
          }
        }
        //console.log(quotations[0].users);
        return notifications;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get yesterday notifications
    async getYesterdayNotifications(parent, args, context) {
      const { user_id, user_type, limit } = args;

      try {
        var notifications = [];
        const notification = await Notification.aggregate([
          { $match: { user_id: user_id, user_type: user_type, status: 0 } },
          {
            $addFields: {
              visitor_id: { $toObjectId: "$visitor_id" },
              visitors_id: { $toString: "$visitor_id" },
              user_id: { $toObjectId: "$user_id" },
              users_id: { $toString: "$user_id" },
              product_id: { $toObjectId: "$product_id" },
              ad_id: { $toObjectId: "$ad_id" },
              blog_id: { $toObjectId: "$blog_id" },
              quotation_id: { $toObjectId: "$quotation_id" },
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
              from: "blogs",
              localField: "blog_id",
              foreignField: "_id",
              as: "blogs",
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
        var today_date = new Date().getTime();
        for (var i = 0; i < notification.length; i++) {
          var noti_date = new Date(notification[i].createdAt).getTime();
          var difference_of_date =
            (today_date - noti_date) / (1000 * 3600 * 24);

          if (difference_of_date > 1) {
            if (notification[i].type === "received_quotation") {
              if (notification[i].quotation[0].isAd) {
                text = `Someone sent a quotation to your ad ${notification[i].ads[0].name}`;
              } else {
                text = `Someone sent a quotation to your product ${notification[i].products[0].name}`;
              }
            }
            if (notification[i].type === "accepted_quotation") {
              if (notification[i].quotation[0].isAd) {
                text = `Someone accepted a quotation of your ad ${notification[i].ads[0].name}`;
              } else {
                text = `Someone accepted a quotation of your product ${notification[i].products[0].name}`;
              }
            }
            if (notification[i].type === "rejected_quotation") {
              if (notification[i].quotation[0].isAd) {
                text = `Someone rejected a quotation of your ad ${notification[i].ads[0].name}`;
              } else {
                text = `Someone rejected a quotation of your product ${notification[i].products[0].name}`;
              }
            }
            if (notification[i].type === "visited") {
              if (notification[i].visitor[0].user_type === "Buyer") {
                text = `A buyer from ${notification[i].visitor[0].city} visited your profile`;
              } else {
                text = `A seller from ${notification[i].visitor[0].city} visited your profile`;
              }
            }
            if (notification[i].type === "placed_bid") {
              if (notification[i].visitor[0].user_type === "Buyer") {
                text = `A buyer placed bid to your product ${notification[i].products[0].name}`;
              } else {
                text = `A seller placed bid to your product ${notification[i].products[0].name}`;
              }
            }
            if (notification[i].type === "uploaded_to_marketplace") {
              text = `${notification[i].visitor[0].company_name} uploaded a new product to marketplace`;
            }
            if (notification[i].type === "uploaded_to_auction") {
              text = `${notification[i].visitor[0].company_name} uploaded a new product to auction`;
            }
            if (notification[i].type === "ending_seller_auction") {
              text = `Your product ${notification[i].products[0].name} in auction is about to end in 12 hours`;
            }
            if (notification[i].type === "approve_blog_comment") {
              text = `Your comment on this blog:  ${notification[i].blogs[0].title} got approved`;
            }
            notifications.push({
              ...notification[i],
              id: notification[i]._id,
              text: text,
            });
          }
        }
        //console.log(quotations[0].users);
        return notifications;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get quotation notifications
    async getQuotationNotifications(parent, args, context) {
      const { user_id, user_type, type, limit } = args;

      try {
        var notifications = [];
        const notification = await Notification.aggregate([
          {
            $match: {
              user_id: user_id,
              user_type: user_type,
              status: 0,
              type: {
                $in: [
                  "received_quotation",
                  "accepted_quotation",
                  "rejected_quotation",
                ],
              },
            },
          },
          {
            $addFields: {
              visitor_id: { $toObjectId: "$visitor_id" },
              visitors_id: { $toString: "$visitor_id" },
              user_id: { $toObjectId: "$user_id" },
              users_id: { $toString: "$user_id" },
              product_id: { $toObjectId: "$product_id" },
              ad_id: { $toObjectId: "$ad_id" },
              quotation_id: { $toObjectId: "$quotation_id" },
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
        var today_date = new Date().getTime();
        for (var i = 0; i < notification.length; i++) {
          var noti_date = new Date(notification[i].createdAt).getTime();
          var difference_of_date =
            (today_date - noti_date) / (1000 * 3600 * 24);
          if (difference_of_date < 1) {
            if (notification[i].type === "received_quotation") {
              if (notification[i].quotation[0].isAd) {
                text = `Someone sent a quotation to your ad ${notification[i].ads[0].name}`;
              } else {
                text = `Someone sent a quotation to your product ${notification[i].products[0].name}`;
              }
            }
            if (notification[i].type === "accepted_quotation") {
              if (notification[i].quotation[0].isAd) {
                text = `Someone accepted a quotation of your ad ${notification[i].ads[0].name}`;
              } else {
                text = `Someone accepted a quotation of your product ${notification[i].products[0].name}`;
              }
            }
            if (notification[i].type === "rejected_quotation") {
              if (notification[i].quotation[0].isAd) {
                text = `Someone rejected a quotation of your ad ${notification[i].ads[0].name}`;
              } else {
                text = `Someone rejected a quotation of your product ${notification[i].products[0].name}`;
              }
            }

            notifications.push({
              ...notification[i],
              id: notification[i]._id,
              text: text,
            });
          }
        }
        //console.log(quotations[0].users);
        return notifications;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get yesterday quotation notifications
    async getYesterdayQuotationNotifications(parent, args, context) {
      const { user_id, user_type, type, limit } = args;

      try {
        var notifications = [];
        const notification = await Notification.aggregate([
          {
            $match: {
              user_id: user_id,
              user_type: user_type,
              status: 0,
              type: {
                $in: [
                  "received_quotation",
                  "accepted_quotation",
                  "rejected_quotation",
                ],
              },
            },
          },
          {
            $addFields: {
              visitor_id: { $toObjectId: "$visitor_id" },
              visitors_id: { $toString: "$visitor_id" },
              user_id: { $toObjectId: "$user_id" },
              users_id: { $toString: "$user_id" },
              product_id: { $toObjectId: "$product_id" },
              ad_id: { $toObjectId: "$ad_id" },
              quotation_id: { $toObjectId: "$quotation_id" },
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
        var today_date = new Date().getTime();
        for (var i = 0; i < notification.length; i++) {
          var noti_date = new Date(notification[i].createdAt).getTime();
          var difference_of_date =
            (today_date - noti_date) / (1000 * 3600 * 24);
          if (difference_of_date > 1) {
            if (notification[i].type === "received_quotation") {
              if (notification[i].quotation[0].isAd) {
                text = `Someone sent a quotation to your ad ${notification[i].ads[0].name}`;
              } else {
                text = `Someone sent a quotation to your product ${notification[i].products[0].name}`;
              }
            }
            if (notification[i].type === "accepted_quotation") {
              if (notification[i].quotation[0].isAd) {
                text = `Someone accepted a quotation of your ad ${notification[i].ads[0].name}`;
              } else {
                text = `Someone accepted a quotation of your product ${notification[i].products[0].name}`;
              }
            }
            if (notification[i].type === "rejected_quotation") {
              if (notification[i].quotation[0].isAd) {
                text = `Someone rejected a quotation of your ad ${notification[i].ads[0].name}`;
              } else {
                text = `Someone rejected a quotation of your product ${notification[i].products[0].name}`;
              }
            }

            notifications.push({
              ...notification[i],
              id: notification[i]._id,
              text: text,
            });
          }
        }
        //console.log(quotations[0].users);
        return notifications;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get single notification
    async getNotification(_, { id }, context) {
      try {
        const notification = await Notification.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(id), status: 0 } },
          {
            $addFields: {
              visitor_id: { $toObjectId: "$visitor_id" },
              visitors_id: { $toString: "$visitor_id" },
              user_id: { $toObjectId: "$user_id" },
              users_id: { $toString: "$user_id" },
              product_id: { $toObjectId: "$product_id" },
              ad_id: { $toObjectId: "$ad_id" },
              blog_id: { $toObjectId: "$blog_id" },
              quotation_id: { $toObjectId: "$quotation_id" },
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
              from: "blogs",
              localField: "blog_id",
              foreignField: "_id",
              as: "blogs",
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

        if (notification) {
          if (notification[0].type === "received_quotation") {
            if (notification[0].quotation[0].isAd) {
              text = `Someone sent a quotation to your ad ${notification[0].ads[0].name}`;
            } else {
              text = `Someone sent a quotation to your product ${notification[0].products[0].name}`;
            }
          }
          if (notification[0].type === "accepted_quotation") {
            if (notification[0].quotation[0].isAd) {
              text = `Someone accepted a quotation of your ad ${notification[0].ads[0].name}`;
            } else {
              text = `Someone accepted a quotation of your product ${notification[0].products[0].name}`;
            }
          }
          if (notification[0].type === "rejected_quotation") {
            if (notification[0].quotation[0].isAd) {
              text = `Someone rejected a quotation of your ad ${notification[0].ads[0].name}`;
            } else {
              text = `Someone rejected a quotation of your product ${notification[0].products[0].name}`;
            }
          }
          if (notification[0].type === "visited") {
            if (notification[0].visitor[0].user_type === "Buyer") {
              text = `A buyer from ${notification[0].visitor[0].city} visited your profile`;
            } else {
              text = `A seller from ${notification[0].visitor[0].city} visited your profile`;
            }
          }
          if (notification[0].type === "placed_bid") {
            if (notification[0].visitor[0].user_type === "Buyer") {
              text = `A buyer placed bid to your product ${notification[0].products[0].name}`;
            } else {
              text = `A seller placed bid to your product ${notification[0].products[0].name}`;
            }
          }
          if (notification[0].type === "uploaded_to_marketplace") {
            text = `${notification[0].visitor[0].company_name} uploaded a new product to marketplace`;
          }
          if (notification[0].type === "uploaded_to_auction") {
            text = `${notification[0].visitor[0].company_name} uploaded a new product to auction`;
          }
          if (notification[0].type === "ending_seller_auction") {
            text = `Your product ${notification[0].products[0].name} in auction is about to end in 12 hours`;
          }
          if (notification[0].type === "approve_blog_comment") {
            text = `Your comment on this blog: ${notification[0].blogs[0].title} got approved`;
          }
          //console.log(product[0]);
          return { ...notification[0], id: notification[0]._id, text: text };
        } else {
          throw new Error("Notification not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    //get unseen notification count
    async getUnseenNotificationCount(parent, args, context) {
      const { user_id, user_type } = args;

      try {
        const notification = await Notification.aggregate([
          {
            $match: {
              user_id: user_id,
              user_type: user_type,
              seen_status: 0,
            },
          },
        ]);

        if (notification) {
          const noti_length = notification.length;
          //console.log(conversations[0].users);
          return noti_length;
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  // Upload: GraphQLUpload,

  Mutation: {
    //create quotation
    async createNotification(
      _,
      {
        input: {
          visitor_id,
          user_id,
          visitor_user_type,
          user_type,
          product_id,
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
          quotation_id.trim() !== ""
        ) {
          const notification = new Notification({
            visitor_id,
            user_id,
            visitor_user_type,
            user_type,
            product_id,
            quotation_id,
          });

          const res = await notification.save();

          return {
            ...res._doc,
            id: res._id,
            message: "Notification is sent.",
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
        throw new UserInputError("Errors occcur while sending notification");
      }
    },

    //update unseen notification count
    async updateUnseenNotificationCount(parent, args, context) {
      const { user_id, user_type } = args;

      try {
        const seen_noti = await Notification.updateMany(
          { user_id: user_id, user_type: user_type },
          {
            $set: { seen_status: 1 },
          },
          { new: true }
        );

        if (seen_noti) {
          const noti_length = seen_noti.length;
          //console.log(conversations[0].users);
          return noti_length;
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    //delete notification
    async deleteNotification(parent, args, context) {
      const { id } = args;

      try {
        const noti = await Notification.findByIdAndUpdate(
          id,
          {
            $set: { status: 1 },
          },
          { new: true }
        );

        if (noti) {
          //console.log(conversations[0].users);
          return { message: "Notification is deleted", success: true };
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
