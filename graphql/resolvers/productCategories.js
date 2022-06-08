const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const ProductCategory = require("../../models/ProductCategory");

const CategoryImageResolver = require("./category_image_resolvers");

module.exports = {
  Query: {
    async getProductCategories(parent, args, context) {
      try {
        const category = await ProductCategory.find().sort({
          createdAt: -1,
        });

        return category;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getProductCategory(_, { id }, context) {
      try {
        const category = await ProductCategory.findById(id);
        if (category) {
          return category;
        } else {
          throw new Error("Product Category not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  // Upload: GraphQLUpload,

  Mutation: {
    //create product category
    createProductCategory: (
      _,
      { input: { name, file, bucketName } },
      context
    ) =>
      new CategoryImageResolver().createProductCategory(
        name,
        file,
        bucketName,
        context
      ),

    //update product category
    async updateProductCategory(parent, args, context, info) {
      const user_check = checkAuth(context);
      const { id } = args;
      const { name } = args.input;

      const updates = {};

      if (name !== undefined || name.trim() !== "") {
        updates.name = name;
      } else {
        return {
          message: "Category name must not be empty.",
          success: true,
        };
      }

      // TODO: Make sure user doesnt already exist
      try {
        if (user_check.isAdmin) {
          const updatedProductCategory =
            await ProductCategory.findByIdAndUpdate(
              id,
              {
                $set: updates,
              },
              { new: true }
            );
          return {
            ...updatedProductCategory._doc,
            id: updatedProductCategory._id,
            message: "Category is updated successfully.",
            success: true,
          };
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        //throw new UserInputError("Errors", { errors });
        throw new UserInputError("Errors occcur while updating");
      }
    },

    //update product category image
    updateProductCategoryImage: (_, { id, file, bucketName }, context) =>
      new CategoryImageResolver().updateProductCategoryImage(
        id,
        file,
        bucketName,
        context
      ),

    //delete product category
    async deleteProductCategory(_, { id }, context) {
      const user = checkAuth(context);

      try {
        const product_category = await ProductCategory.findById(id);
        if (user.isAdmin) {
          await product_category.delete();
          return { message: "Category deleted successfully", success: true };
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
