const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const HeaderCategory = require("../../models/HeaderCategory");

module.exports = {
  Query: {
    async getHeaderCategories(parent, args, context) {
      try {
        const header_category = await HeaderCategory.find().sort({
          createdAt: -1,
        });

        return header_category;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getHeaderCategory(_, { id }, context) {
      try {
        const header_category = await HeaderCategory.findById(id);
        if (header_category) {
          return header_category;
        } else {
          throw new Error("Header Category not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  // Upload: GraphQLUpload,

  Mutation: {
    //create header category
    async createHeaderCategory(_, { input: { name } }, context) {
      const user_check = checkAuth(context);
      try {
        if (user_check.isAdmin) {
          if (name !== undefined || name.trim() !== "") {
            const newHeaderCategory = new HeaderCategory({ name });

            const res = await newHeaderCategory.save();

            return {
              ...res._doc,
              id: res._id,
              message: "Category is created successfully.",
              success: true,
            };
          } else {
            return {
              ...res._doc,
              id: res._id,
              message: "Category name must not be empty.",
              success: false,
            };
          }
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new UserInputError("Errors occcur while updating");
      }
    },

    //update header category
    async updateHeaderCategory(parent, args, context, info) {
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
          const updatedHeaderCategory = await HeaderCategory.findByIdAndUpdate(
            id,
            {
              $set: updates,
            },
            { new: true }
          );
          return {
            ...updatedHeaderCategory._doc,
            id: updatedHeaderCategory._id,
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

    //delete user
    async deleteHeaderCategory(_, { id }, context) {
      const user = checkAuth(context);

      try {
        const header_category = await HeaderCategory.findById(id);
        if (user.isAdmin) {
          await header_category.delete();
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
