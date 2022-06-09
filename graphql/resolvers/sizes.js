const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Size = require("../../models/Size");

module.exports = {
  Query: {
    async getSizes(parent, args, context) {
      try {
        const size = await Size.find().sort({
          createdAt: -1,
        });

        return size;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getSize(_, { id }, context) {
      try {
        const size = await Size.findById(id);
        if (size) {
          return size;
        } else {
          throw new Error("Size not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  // Upload: GraphQLUpload,

  Mutation: {
    //create size
    async createSize(_, { input: { name } }, context) {
      const user_check = checkAuth(context);
      try {
        if (user_check.isAdmin) {
          if (name.trim() !== "") {
            const size = new Size({ name });

            const res = await size.save();

            return {
              ...res._doc,
              id: res._id,
              message: "Size is created successfully.",
              success: true,
            };
          } else {
            return {
              ...res._doc,
              id: res._id,
              message: "Fill up all the fields.",
              success: false,
            };
          }
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new UserInputError("Errors occcur while creating");
      }
    },

    //update size
    async updateSize(parent, args, context, info) {
      const user_check = checkAuth(context);
      const { id } = args;
      const { name } = args.input;

      const updates = {};

      if (name !== undefined) {
        updates.name = name;
      }

      // TODO: Make sure user doesnt already exist
      try {
        if (user_check.isAdmin) {
          const size = await Size.findByIdAndUpdate(
            id,
            {
              $set: updates,
            },
            { new: true }
          );
          return {
            ...size._doc,
            id: size._id,
            message: "Size is updated successfully.",
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

    //delete size
    async deleteSize(_, { id }, context) {
      const user = checkAuth(context);

      try {
        const size = await Size.findById(id);
        if (user.isAdmin) {
          await size.delete();
          return { message: "Size deleted successfully", success: true };
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
