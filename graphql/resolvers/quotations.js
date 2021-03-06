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
const Notifications = require("../../models/Notification");
const BuyerActivities = require("../../models/BuyerActivity");

module.exports = {
  Query: {
    //get received quotations
    async getReceivedQuotations(parent, args, context) {
      const { receiver_id, isAd, limit } = args;

      var updates = {};

      if (receiver_id !== undefined && receiver_id !== "") {
        updates.receiver_id = receiver_id;
      }

      if (isAd !== undefined && isAd !== "") {
        updates.isAd = isAd;
      }

      try {
        var quotations = [];
        const quotation = await Quotation.aggregate([
          { $match: updates },
          {
            $addFields: {
              sender_id: { $toObjectId: "$sender_id" },
              senders_id: { $toString: "$sender_id" },
              product_id: { $toObjectId: "$product_id" },
              ad_id: { $toObjectId: "$ad_id" },
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
        ])
          .sort({ createdAt: -1 })
          .limit(limit);

        for (var i = 0; i < quotation.length; i++) {
          quotations.push({
            ...quotation[i],
            id: quotation[i]._id,
          });
        }
        //console.log(quotations[0].users);
        return quotations;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get single received quotation modal data
    async getReceivedQuotationModal(_, { id }, context) {
      try {
        const quotation = await Quotation.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(id) } },
          {
            $addFields: {
              sender_id: { $toObjectId: "$sender_id" },
              senders_id: { $toString: "$sender_id" },
              product_id: { $toObjectId: "$product_id" },
              ad_id: { $toObjectId: "$ad_id" },
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
        ]);

        if (quotation) {
          //console.log(product[0]);
          return { ...quotation[0], id: quotation[0]._id };
        } else {
          throw new Error("Quotation not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    //get sent quotations
    async getSentQuotations(parent, args, context) {
      const { sender_id, limit, isAd } = args;

      var updates = {};

      if (sender_id !== undefined && sender_id !== "") {
        updates.sender_id = sender_id;
      }

      if (isAd !== undefined && isAd !== "") {
        updates.isAd = isAd;
      }

      try {
        var quotations = [];
        const quotation = await Quotation.aggregate([
          { $match: updates },
          {
            $addFields: {
              receiver_id: { $toObjectId: "$receiver_id" },
              receivers_id: { $toString: "$receiver_id" },
              product_id: { $toObjectId: "$product_id" },
              ad_id: { $toObjectId: "$ad_id" },
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
              localField: "receiver_id",
              foreignField: "_id",
              as: "receiver",
            },
          },

          {
            $lookup: {
              from: "sellers",
              localField: "receivers_id",
              foreignField: "user_id",
              as: "sellers",
            },
          },
          {
            $lookup: {
              from: "buyers",
              localField: "receivers_id",
              foreignField: "user_id",
              as: "buyers",
            },
          },
        ])
          .sort({ createdAt: -1 })
          .limit(limit);

        for (var i = 0; i < quotation.length; i++) {
          quotations.push({
            ...quotation[i],
            id: quotation[i]._id,
          });
        }
        //console.log(products);
        return quotations;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get single sent quotation modal data
    async getSentQuotationModal(_, { id }, context) {
      try {
        const quotation = await Quotation.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(id) } },
          {
            $addFields: {
              receiver_id: { $toObjectId: "$receiver_id" },
              receivers_id: { $toString: "$receiver_id" },
              product_id: { $toObjectId: "$product_id" },
              ad_id: { $toObjectId: "$ad_id" },
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
              localField: "receiver_id",
              foreignField: "_id",
              as: "receiver",
            },
          },
          {
            $lookup: {
              from: "sellers",
              localField: "receivers_id",
              foreignField: "user_id",
              as: "sellers",
            },
          },
        ]);

        if (quotation) {
          //console.log(product[0]);
          return { ...quotation[0], id: quotation[0]._id };
        } else {
          throw new Error("Quotation not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  // Upload: GraphQLUpload,

  Mutation: {
    //create quotation
    async createQuotation(
      _,
      {
        input: {
          sender_id,
          receiver_id,
          sender_user_type,
          receiver_user_type,
          product_id,
          ad_id,
          color,
          size,
          quantity,
          price,
          isAd,
        },
      },
      context
    ) {
      //const user_check = await checkAuth(context);
      try {
        //if (user_check.isAdmin) {
        if (
          sender_id.trim() !== "" &&
          receiver_id.trim() !== "" &&
          sender_user_type.trim() !== "" &&
          receiver_user_type.trim() !== "" &&
          quantity.trim() !== "" &&
          price.trim() !== ""
        ) {
          const quotation = new Quotation({
            sender_id,
            receiver_id,
            sender_user_type,
            receiver_user_type,
            product_id,
            ad_id,
            color,
            size,
            quantity,
            price,
            totalPrice: quantity * price,
            isAd,
          });

          const res = await quotation.save();

          //send noti

          if (res) {
            if (res.isAd) {
              var res_id = res._id.toString();
              const notification = new Notifications({
                type: "received_quotation",
                visitor_id: sender_id,
                user_id: receiver_id,
                visitor_user_type: sender_user_type,
                user_type: receiver_user_type,
                ad_id,
                quotation_id: res_id,
                text: "Someone sent you an ad quotation",
              });
              const res_noti = await notification.save();
            } else {
              var res_id = res._id.toString();
              const notification = new Notifications({
                type: "received_quotation",
                visitor_id: sender_id,
                user_id: receiver_id,
                visitor_user_type: sender_user_type,
                user_type: receiver_user_type,
                product_id,
                quotation_id: res_id,
                text: "Someone sent you a quotation",
              });
              const res_noti = await notification.save();
            }

            // console.log(res_id);
          }

          //send activity
          if (res && sender_user_type === "Buyer") {
            if (res.isAd) {
              var res_id = res._id.toString();
              const activity = new BuyerActivities({
                type: "quotation",
                visitor_id: receiver_id,
                user_id: sender_id,
                visitor_user_type: receiver_user_type,
                user_type: sender_user_type,
                ad_id,
                quotation_id: res_id,
                text: "You sent an ad quotation",
              });

              const res_act = await activity.save();
            } else {
              var res_id = res._id.toString();
              const activity = new BuyerActivities({
                type: "quotation",
                visitor_id: receiver_id,
                user_id: sender_id,
                visitor_user_type: receiver_user_type,
                user_type: sender_user_type,
                product_id,
                quotation_id: res_id,
                text: "You sent a quotation",
              });

              const res_act = await activity.save();
            }
          }

          return {
            ...res._doc,
            id: res._id,
            message: "Quotation is sent.",
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
        throw new UserInputError("Errors occcur while sending quotation");
      }
    },

    //accept quotation
    async acceptQuotation(parent, args, context, info) {
      //const user_check = await checkAuth(context);

      const { id } = args;
      //const { status } = args.input;

      // TODO: Make sure user doesnt already exist
      try {
        // if (user_check.isAdmin) {
        const quotation = await Quotation.findByIdAndUpdate(
          id,
          {
            $set: { status: 1 },
          },
          { new: true }
        );

        //send noti
        // const quotation_query = await Quotation.findById(id);

        //console.log(quotation);

        if (quotation) {
          if (quotation.isAd) {
            var res_id = quotation._id.toString();
            const notification = new Notifications({
              type: "accepted_quotation",
              visitor_id: quotation.receiver_id,
              user_id: quotation.sender_id,
              visitor_user_type: quotation.receiver_user_type,
              user_type: quotation.sender_user_type,
              ad_id: quotation.ad_id,
              quotation_id: res_id,
              text: "Someone accepted your ad quotation",
            });

            const res_noti = await notification.save();
          } else {
            var res_id = quotation._id.toString();
            const notification = new Notifications({
              type: "accepted_quotation",
              visitor_id: quotation.receiver_id,
              user_id: quotation.sender_id,
              visitor_user_type: quotation.receiver_user_type,
              user_type: quotation.sender_user_type,
              product_id: quotation.product_id,
              quotation_id: res_id,
              text: "Someone accepted your quotation",
            });

            const res_noti = await notification.save();
          }
        }

        return {
          ...quotation._doc,
          message: "Quotation is accepted.",
          success: true,
        };
        // } else {
        //   throw new AuthenticationError("Action not allowed");
        // }
      } catch (err) {
        //throw new UserInputError("Errors", { errors });
        throw new UserInputError("Errors occcur while accepting");
      }
    },

    //reject quotation
    async rejectQuotation(parent, args, context, info) {
      //const user_check = await checkAuth(context);
      const { id } = args;
      //const { status } = args.input;

      // TODO: Make sure user doesnt already exist
      try {
        // if (user_check.isAdmin) {
        const quotation = await Quotation.findByIdAndUpdate(
          id,
          {
            $set: { status: 2 },
          },
          { new: true }
        );

        if (quotation) {
          if (quotation.isAd) {
            var res_id = quotation._id.toString();
            const notification = new Notifications({
              type: "rejected_quotation",
              visitor_id: quotation.receiver_id,
              user_id: quotation.sender_id,
              visitor_user_type: quotation.receiver_user_type,
              user_type: quotation.sender_user_type,
              ad_id: quotation.ad_id,
              quotation_id: res_id,
              text: "Someone rejected your ad quotation",
            });

            const res_noti = await notification.save();
          } else {
            var res_id = quotation._id.toString();
            const notification = new Notifications({
              type: "rejected_quotation",
              visitor_id: quotation.receiver_id,
              user_id: quotation.sender_id,
              visitor_user_type: quotation.receiver_user_type,
              user_type: quotation.sender_user_type,
              product_id: quotation.product_id,
              quotation_id: res_id,
              text: "Someone rejected your quotation",
            });

            const res_noti = await notification.save();
          }
        }
        return {
          ...quotation._doc,
          message: "Quotation is rejected.",
          success: true,
        };
        // } else {
        //   throw new AuthenticationError("Action not allowed");
        // }
      } catch (err) {
        //throw new UserInputError("Errors", { errors });
        throw new UserInputError("Errors occcur while rejecting");
      }
    },
  },
};
