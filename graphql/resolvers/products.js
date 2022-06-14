const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");
const ProductImageResolver = require("./product_image_resolvers");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Product = require("../../models/Product");
const User = require("../../models/User");
const Seller = require("../../models/Seller");
const Buyer = require("../../models/Buyer");

module.exports = {
  Query: {
    async getProducts(parent, args, context) {
      try {
        const product = await Product.find().sort({
          createdAt: -1,
        });

        return product;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getProduct(_, { id }, context) {
      try {
        const product = await Product.findOne({ _id: id });
        if (product) {
          return product;
        } else {
          throw new Error("Product not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

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
