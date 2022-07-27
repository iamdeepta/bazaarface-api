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
const Bid = require("../../models/Bid");
const Message = require("../../models/Message");
const Conversation = require("../../models/Conversation");
const Size = require("../../models/Size");
const Notifications = require("../../models/Notification");
const BuyerActivities = require("../../models/BuyerActivity");

const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

module.exports = {
  Query: {
    //get bids
    async getBids(parent, args, context) {
      const { receiver_id, limit } = args;

      try {
        var bids = [];
        const bid = await Bid.aggregate([
          { $match: { receiver_id: receiver_id } },
          {
            $addFields: {
              sender_id: { $toObjectId: "$sender_id" },
              senders_id: { $toString: "$sender_id" },
              product_id: { $toObjectId: "$product_id" },
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

        for (var i = 0; i < bid.length; i++) {
          bids.push({
            ...bid[i],
            id: bid[i]._id,
          });
        }
        //console.log(quotations[0].users);
        return bids;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get single bid
    async getSingleBid(_, { id }, context) {
      try {
        const bid = await Bid.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(id) } },
          {
            $addFields: {
              sender_id: { $toObjectId: "$sender_id" },
              senders_id: { $toString: "$sender_id" },
              product_id: { $toObjectId: "$product_id" },
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

        if (bid) {
          //console.log(product[0]);
          return { ...bid[0], id: bid[0]._id };
        } else {
          throw new Error("Bid not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  // Upload: GraphQLUpload,

  Mutation: {
    //create bid
    async createBid(
      _,
      {
        input: {
          sender_id,
          receiver_id,
          sender_user_type,
          receiver_user_type,
          conversation_id,
          text,
          product_id,
          color,
          size,
          quantity,
          price,
        },
      },
      context
    ) {
      const existing_convo = await Conversation.find({
        sender_id: { $in: [sender_id, receiver_id] },
        receiver_id: { $in: [sender_id, receiver_id] },
        sender_user_type,
        receiver_user_type,
      });

      const product = await Product.find({
        _id: mongoose.Types.ObjectId(product_id),
      });

      //console.log(product);

      //const user_check = await checkAuth(context);
      try {
        //if (user_check.isAdmin) {
        if (
          sender_id.trim() !== "" &&
          receiver_id.trim() !== "" &&
          sender_user_type.trim() !== "" &&
          receiver_user_type.trim() !== "" &&
          product_id.trim() !== "" &&
          color.trim() !== "" &&
          size.trim() !== "" &&
          quantity.trim() !== "" &&
          price.trim() !== ""
        ) {
          const bid = new Bid({
            sender_id,
            receiver_id,
            sender_user_type,
            receiver_user_type,
            product_id,
            color,
            size,
            quantity,
            price,
            totalPrice: quantity * price,
          });

          //if convo exists or not
          if (existing_convo.length <= 0) {
            const conversation = new Conversation({
              sender_id,
              receiver_id,
              sender_user_type,
              receiver_user_type,
            });

            const res_convo = await conversation.save();

            const messages = new Message({
              conversation_id: res_convo._id,
              sender_id,
              sender_user_type,
              text: `I have placed bid for ${quantity} ${
                product[0].name
              } | Price: ${price} TK/piece | Color: ${color} | Size: ${size} | Total Price: ${
                quantity * price
              } TK`,
            });

            const res_msg = await messages.save();

            const seen_conversation = await Conversation.updateOne(
              {
                _id: mongoose.Types.ObjectId(res_convo._id),
              },
              {
                $set: { status: 0 },
              },
              { new: true }
            );
          } else {
            const messages = new Message({
              conversation_id: existing_convo[0]._id,
              sender_id,
              sender_user_type,
              text: `I have placed bid for ${quantity} ${
                product[0].name
              } | Price: ${price} TK/piece | Color: ${color} | Size: ${size} | Total Price: ${
                quantity * price
              } TK`,
            });

            //console.log(existing_convo._id);

            const res_msg = await messages.save();

            const seen_conversation = await Conversation.updateOne(
              {
                _id: mongoose.Types.ObjectId(existing_convo[0]._id),
              },
              {
                $set: { status: 0 },
              },
              { new: true }
            );
          }

          const res = await bid.save();

          //set highest bid price
          if (res) {
            const product = await Product.findById(res.product_id);

            if (
              product.highest_bid_price !== "0" ||
              product.highest_bid_price !== null ||
              product.highest_bid_price !== undefined
            ) {
              if (res.price > product.highest_bid_price) {
                const bid_price = await Product.findByIdAndUpdate(
                  res.product_id,
                  {
                    $set: { highest_bid_price: res.price },
                  },
                  { new: true }
                );
              }
            } else {
              const bid_price1 = await Product.findByIdAndUpdate(
                res.product_id,
                {
                  $set: { highest_bid_price: res.price },
                },
                { new: true }
              );
            }
          }

          //send noti
          if (res) {
            var res_id = res._id.toString();
            const notification = new Notifications({
              type: "placed_bid",
              visitor_id: sender_id,
              user_id: receiver_id,
              visitor_user_type: sender_user_type,
              user_type: receiver_user_type,
              product_id: product_id,
              bid_id: res_id,
              text: "Someone placed a bid",
            });

            const res_noti = await notification.save();
          }

          //send activity
          if (res) {
            var res_id = res._id.toString();
            const activity = new BuyerActivities({
              type: "bid",
              visitor_id: receiver_id,
              user_id: sender_id,
              visitor_user_type: receiver_user_type,
              user_type: sender_user_type,
              product_id: product_id,
              bid_id: res_id,
              text: "You have placed a bid",
            });

            const res_act = await activity.save();
          }

          pubsub.publish("NEW_BID", {
            newBid: {
              ...res._doc,
              id: res._id,
              message: "Bid is placed.",
              success: true,
            },
          });

          return {
            ...res._doc,
            id: res._id,
            message: "Bid is placed.",
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
        throw new UserInputError("Errors occcur while placing bid");
      }
    },

    //accept bid
    async acceptBid(parent, args, context, info) {
      //const user_check = await checkAuth(context);
      const { id } = args;
      const { status } = args.input;

      // TODO: Make sure user doesnt already exist
      try {
        // if (user_check.isAdmin) {
        const bid = await Bid.findByIdAndUpdate(
          id,
          {
            $set: { status: 1 },
          },
          { new: true }
        );
        return {
          ...bid._doc,
          message: "Bid is accepted.",
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

    //reject bid
    async rejectBid(parent, args, context, info) {
      //const user_check = await checkAuth(context);
      const { id } = args;
      const { status } = args.input;

      // TODO: Make sure user doesnt already exist
      try {
        // if (user_check.isAdmin) {
        const bid = await Bid.findByIdAndUpdate(
          id,
          {
            $set: { status: 2 },
          },
          { new: true }
        );
        return {
          ...bid._doc,
          message: "Bid is rejected.",
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

  Subscription: {
    newBid: {
      subscribe: (_, __, context) => pubsub.asyncIterator(["NEW_BID"]),
    },
  },
};
