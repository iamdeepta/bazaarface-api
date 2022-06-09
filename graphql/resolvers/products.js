const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");
const ProductImageResolver = require("./product_image_resolvers");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Product = require("../../models/Product");

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
      const user_check = checkAuth(context);
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
  },
};
