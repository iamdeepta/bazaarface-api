const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");
const ProductImageResolver = require("./product_image_resolvers");
const mongoose = require("mongoose");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Product = require("../../models/Product");
const User = require("../../models/User");
const Seller = require("../../models/Seller");
const Buyer = require("../../models/Buyer");
const Category = require("../../models/ProductCategory");
const Notifications = require("../../models/Notification");
const BuyerActivities = require("../../models/BuyerActivity");

module.exports = {
  Query: {
    //get products with filter
    async getProducts(parent, args, context) {
      const { category_id, country_id, limit } = args;
      var updates = {};

      if (category_id !== undefined && category_id !== "") {
        updates.category = category_id;
      }

      if (
        country_id !== undefined &&
        country_id !== null &&
        country_id.length !== 0
      ) {
        updates.country = { $in: country_id };
      }
      try {
        var products = [];
        const product = await Product.aggregate([
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
        ])
          .sort({ createdAt: -1 })
          .limit(limit);

        for (var i = 0; i < product.length; i++) {
          products.push({
            ...product[i],
            id: product[i]._id,
          });
        }
        //console.log(products);
        return products;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get seller products
    async getSellerProducts(parent, args, context) {
      const { user_id, user_type, limit } = args;
      var updates = {};

      try {
        var products = [];
        const product = await Product.aggregate([
          { $match: { user_id: user_id, user_type: user_type } },
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
        ])
          .sort({ createdAt: -1 })
          .limit(limit);

        for (var i = 0; i < product.length; i++) {
          products.push({
            ...product[i],
            id: product[i]._id,
          });
        }
        //console.log(products);
        return products;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get single product
    async getProduct(_, { id }, context) {
      const check_user = await checkAuth(context);
      try {
        const product = await Product.aggregate([
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
        ]);

        if (product) {
          //send activity
          if (check_user.id !== product[0].user_id) {
            var prod_id = product[0]._id.toString();
            const activity = new BuyerActivities({
              type: "visit_product",
              visitor_id: product[0].user_id,
              user_id: user_check.id,
              visitor_user_type: "Seller",
              user_type: "Buyer",
              product_id: prod_id,
              text: "You visited a product",
            });

            const res_activity = await activity.save();
          }
          //console.log(product[0]);
          return { ...product[0], id: product[0]._id };
        } else {
          throw new Error("Product not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    //get more like this products
    async getProductsMoreLikeThis(parent, args, context) {
      try {
        var products = [];
        const product = await Product.aggregate([
          { $match: { category: args.category_id } },
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
        ]).sort({ createdAt: -1 });

        for (var i = 0; i < product.length; i++) {
          products.push({
            ...product[i],
            id: product[i]._id,
          });
        }
        //console.log(products);
        return products;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get add to auction modal data
    async getAddToAuctionModal(parent, { id, user_id }, context) {
      try {
        const product = await Product.findOne({ _id: id });
        const user = await User.findById(user_id);
        if (product && user) {
          return {
            ...product._doc,
            user: {
              company_name: user.company_name,
              city: user.city,
              country: user.country,
            },
          };
        } else {
          throw new Error("Product not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    //get product view modal data
    async getProductViewModal(parent, { id, user_id }, context) {
      try {
        const product = await Product.findOne({ _id: id });
        const user = await User.findById(user_id);
        var user_type = user.user_type;
        var userType;
        if (user_type === "Seller") {
          userType = await Seller.findOne({ user_id: user_id });
        }
        if (user_type === "Buyer") {
          userType = await Buyer.findOne({ user_id: user_id });
        }

        if (product && user && userType) {
          return {
            ...product._doc,
            user: {
              company_name: user.company_name,
              city: user.city,
              country: user.country,
              firstname: user.firstname,
              seller: {
                profile_image: userType.profile_image,
              },
              buyer: {
                profile_image: userType.profile_image,
              },
            },
          };
        } else {
          throw new Error("Product not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    //get auction products with filters
    async getAuctionProducts(parent, args, context) {
      const check_user = await checkAuth(context);
      const { category_id, country_id, limit } = args;
      var updates = {};

      updates.isAuction = true;

      if (category_id !== undefined && category_id !== "") {
        updates.category = category_id;
      }

      if (
        country_id !== undefined &&
        country_id !== null &&
        country_id.length !== 0
      ) {
        updates.country = { $in: country_id };
      }
      try {
        var products = [];
        const product = await Product.aggregate([
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
        ])
          .sort({ createdAt: -1 })
          .limit(limit);

        var text = "";
        for (var i = 0; i < product.length; i++) {
          //send noti
          const remaining_auction_day =
            (new Date().getTime() -
              new Date(product[i].postedAtAuction).getTime()) /
            (1000 * 3600 * 24);

          if (product[i].isNotified === false) {
            if (product[i].duration > 0) {
              // console.log(product[i].duration - remaining_auction_day);
              if (
                product[i].duration - remaining_auction_day <= 0.5 &&
                product[i].duration - remaining_auction_day > 0
              ) {
                const product_id = product[i]._id.toString();
                const notification = new Notifications({
                  type: "ending_seller_auction",
                  visitor_id: product[i].user_id,
                  user_id: check_user.id,
                  visitor_user_type: product[i].user_type,
                  user_type: product[i].user_type,
                  product_id: product_id,
                  text: "This product in auction is about to end in 12 hours",
                });

                const res_noti = await notification.save();

                if (res_noti) {
                  const update_isNotified = await Product.findByIdAndUpdate(
                    product[i]._id,
                    {
                      $set: { isNotified: true },
                    },
                    { new: true }
                  );
                }
              }
            }
            // else {
            //   const update_isAuction = await Product.findByIdAndUpdate(
            //     product[i]._id,
            //     {
            //       $set: { isAuction: false },
            //     },
            //     { new: true }
            //   );
            // }
          }

          //set isAuction to false if auction duration is over
          if (product[i].isAuction === true) {
            if (product[i].duration - remaining_auction_day <= 0.0) {
              const update_isAuction = await Product.findByIdAndUpdate(
                product[i]._id,
                {
                  $set: { isAuction: false },
                },
                { new: true }
              );
            }
          }

          const cat = await Category.findOne({ _id: product[i].category });
          products.push({
            ...product[i],
            id: product[i]._id,
            category: cat.name,
          });
        }
        //console.log(products);
        return products;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get auction modal view data
    async getAuctionProductModalView(_, { id }, context) {
      try {
        const product = await Product.aggregate([
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

        if (product) {
          //console.log(product[0]);
          return { ...product[0], id: product[0]._id };
        } else {
          throw new Error("Product not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    //get more like this auction products
    async getAuctionProductsMoreLikeThis(parent, args, context) {
      try {
        var products = [];
        const product = await Product.aggregate([
          { $match: { category: args.category_id, isAuction: true } },
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

        for (var i = 0; i < product.length; i++) {
          const cat = await Category.findOne({ _id: product[i].category });
          products.push({
            ...product[i],
            id: product[i]._id,
            category: cat.name,
          });
        }
        //console.log(products);
        return products;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get total products
    async getTotalProduct(parent, data, context) {
      const user = await checkAuth(context);
      try {
        const products = await Product.find();
        if (user.isAdmin) {
          return products.length;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    //get total auction product
    async getTotalAuctionProduct(parent, data, context) {
      const user = await checkAuth(context);
      try {
        const auction = await Product.find({ isAuction: true });
        if (user.isAdmin) {
          return auction.length;
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
    //create product
    createProduct: (
      _,
      {
        input: {
          user_id,
          user_type,
          name,
          description,
          gender,
          colors,
          sizes,
          manufacturer,
          quantity,
          category,
          fabric,
          supplier,
          gsm,
          country,
          price,
          files,
          bucketName,
        },
      }
    ) =>
      new ProductImageResolver().createProduct(
        user_id,
        user_type,
        name,
        description,
        gender,
        colors,
        sizes,
        manufacturer,
        quantity,
        category,
        fabric,
        supplier,
        gsm,
        country,
        price,
        files,
        bucketName
      ),

    //update product
    async updateProduct(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id } = args;
      const {
        name,
        description,
        gender,
        colors,
        sizes,
        manufacturer,
        quantity,
        category,
        fabric,
        supplier,
        gsm,
        country,
        price,
      } = args.input;

      const updates = {};

      if (name !== undefined) {
        updates.name = name;
      }

      if (description !== undefined) {
        updates.description = description;
      }

      if (gender !== undefined) {
        updates.gender = gender;
      }

      if (manufacturer !== undefined) {
        updates.production = manufacturer;
      }

      if (quantity !== undefined) {
        updates.quantity = quantity;
      }

      if (category !== undefined) {
        updates.category = category;
      }

      if (fabric !== undefined) {
        updates.fabric = fabric;
      }

      if (supplier !== undefined) {
        updates.supplier = supplier;
      }

      if (gsm !== undefined) {
        updates.gsm = gsm;
      }

      if (country !== undefined) {
        updates.country = country;
      }

      if (price !== undefined) {
        updates.price = price;
      }

      if (colors !== undefined) {
        updates.colors = colors;
      }

      if (sizes !== undefined) {
        updates.sizes = sizes;
      }

      // TODO: Make sure user doesnt already exist
      try {
        // if (user_check.isAdmin) {
        const product = await Product.findByIdAndUpdate(
          id,
          {
            $set: updates,
          },
          { new: true }
        );
        return {
          ...product._doc,
          message: "Product is updated successfully.",
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

    //update product image
    updateProductImage: (_, { id, pic_name, file, bucketName }) =>
      new ProductImageResolver().updateProductImage(
        id,
        pic_name,
        file,
        bucketName
      ),

    //delete product
    deleteProductImage: (_, { id, pic_name, bucketName }) =>
      new ProductImageResolver().deleteProductImage(id, pic_name, bucketName),

    //add to auction
    async addToAuction(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { user_id } = args;
      const { id, auction_quantity, price, duration, payment } = args.input;

      const updates = {};

      if (
        auction_quantity.trim() !== "" &&
        price.trim() !== "" &&
        // total_auction_price.trim() !== "" &&
        duration !== "" &&
        payment.trim() !== ""
      ) {
        updates.auction_quantity = auction_quantity;
        updates.price = price;
        updates.total_auction_price = Number(price) * Number(auction_quantity);
        updates.duration = duration;
        updates.payment = payment;
        updates.isAuction = true;
        updates.postedAtAuction = new Date().toISOString();
      } else {
        return {
          message: "Please fill up all the fields.",
          success: false,
        };
      }

      //find if auction date is over
      //console.log(new Date(updates.postedAtAuction).getTime() - new Date());

      // TODO: Make sure user doesnt already exist
      try {
        const auction = await Product.findOne({ _id: id, isAuction: true });

        if (!auction) {
          if (user_check.id === user_id) {
            const product = await Product.findByIdAndUpdate(
              id,
              {
                $set: updates,
              },
              { new: true }
            );

            //send noti
            if (product) {
              const user_followers = await Seller.find({ user_id: user_id });

              for (var i = 0; i < user_followers[0].followers.length; i++) {
                const buyer = await Buyer.findById(
                  user_followers[0].followers[i]
                );
                //console.log(buyer);
                const seller = await Seller.findById(
                  user_followers[0].followers[i]
                );
                //console.log(seller);

                var notification;

                if (seller) {
                  product_id = product._id.toString();
                  notification = new Notifications({
                    type: "uploaded_to_auction",
                    visitor_id: product.user_id,
                    user_id: seller.user_id,
                    visitor_user_type: product.user_type,
                    user_type: "Seller",
                    product_id: product_id,
                    text: "Someone uploaded a product to auction.",
                  });
                  const res_noti = await notification.save();
                }

                if (buyer) {
                  product_id = product._id.toString();
                  notification = new Notifications({
                    type: "uploaded_to_auction",
                    visitor_id: product.user_id,
                    user_id: buyer.user_id,
                    visitor_user_type: product.user_type,
                    user_type: "Buyer",
                    product_id: product_id,
                    text: "Someone uploaded a product to auction.",
                  });
                  const res_noti = await notification.save();
                }
              }
            }

            return {
              ...product._doc,
              message: "Product is added to auction.",
              success: true,
            };
          } else {
            throw new AuthenticationError("Action not allowed");
          }
        } else {
          return {
            message: "This product is already added to auction",
            success: false,
          };
        }
      } catch (err) {
        //throw new UserInputError("Errors", { errors });
        throw new UserInputError("Errors occcur while adding");
      }
    },

    //add to marketplace
    async addToMarketplace(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { user_id } = args;
      const { id, marketplace_quantity, price, total_marketplace_price } =
        args.input;

      const updates = {};

      if (
        marketplace_quantity.trim() !== "" &&
        price.trim() !== ""
        // total_auction_price.trim() !== "" &&
      ) {
        updates.marketplace_quantity = marketplace_quantity;
        updates.price = price;
        updates.total_marketplace_price =
          Number(price) * Number(marketplace_quantity);
        updates.isMarketplace = true;
        updates.postedAtMarketplace = new Date().toISOString();
      } else {
        return {
          message: "Please fill up all the fields.",
          success: false,
        };
      }

      // TODO: Make sure user doesnt already exist
      try {
        const marketplace = await Product.findOne({
          _id: id,
          isMarketplace: true,
        });

        if (!marketplace) {
          if (user_check.id === user_id) {
            const product = await Product.findByIdAndUpdate(
              id,
              {
                $set: updates,
              },
              { new: true }
            );

            //send noti
            if (product) {
              const user_followers = await Seller.find({ user_id: user_id });

              for (var i = 0; i < user_followers[0].followers.length; i++) {
                const buyer = await Buyer.findById(
                  user_followers[0].followers[i]
                );
                //console.log(buyer);
                const seller = await Seller.findById(
                  user_followers[0].followers[i]
                );
                //console.log(seller);

                var notification;

                if (seller) {
                  product_id = product._id.toString();
                  notification = new Notifications({
                    type: "uploaded_to_marketplace",
                    visitor_id: product.user_id,
                    user_id: seller.user_id,
                    visitor_user_type: product.user_type,
                    user_type: "Seller",
                    product_id: product_id,
                    text: "Someone uploaded a product to marketplace.",
                  });
                  const res_noti = await notification.save();
                }

                if (buyer) {
                  product_id = product._id.toString();
                  notification = new Notifications({
                    type: "uploaded_to_marketplace",
                    visitor_id: product.user_id,
                    user_id: buyer.user_id,
                    visitor_user_type: product.user_type,
                    user_type: "Buyer",
                    product_id: product_id,
                    text: "Someone uploaded a product to marketplace.",
                  });
                  const res_noti = await notification.save();
                }
              }
            }

            return {
              ...product._doc,
              message: "Product is added to marketplace.",
              success: true,
            };
          } else {
            throw new AuthenticationError("Action not allowed");
          }
        } else {
          return {
            message: "This product is already added to marketplace",
            success: false,
          };
        }
      } catch (err) {
        //throw new UserInputError("Errors", { errors });
        throw new UserInputError("Errors occcur while adding");
      }
    },
  },
};
