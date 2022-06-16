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

module.exports = {
  Query: {
    //get products with filter
    async getProducts(parent, args, context) {
      const { category_id, country_id } = args;
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

    //get single product
    async getProduct(_, { id }, context) {
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
      const { category_id, country_id } = args;
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
          .limit(12);

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
        duration.trim() !== "" &&
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
