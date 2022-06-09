const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Color = require("../../models/Color");

module.exports = {
  Query: {
    async getColors(parent, args, context) {
      try {
        const color = await Color.find().sort({
          createdAt: -1,
        });

        return color;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getColor(_, { id }, context) {
      try {
        const color = await Color.findById(id);
        if (color) {
          return color;
        } else {
          throw new Error("Color not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  // Upload: GraphQLUpload,

  Mutation: {
    //create color
    async createColor(_, { input: { name, code } }, context) {
      const user_check = checkAuth(context);
      try {
        if (user_check.isAdmin) {
          if (name.trim() !== "" || code.trim() !== "") {
            const color = new Color({ name, code });

            const res = await color.save();

            return {
              ...res._doc,
              id: res._id,
              message: "Color is created successfully.",
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

    //update color
    async updateColor(parent, args, context, info) {
      const user_check = checkAuth(context);
      const { id } = args;
      const { name, code } = args.input;

      const updates = {};

      if (name !== undefined) {
        updates.name = name;
      }

      if (code !== undefined) {
        updates.code = code;
      }

      // TODO: Make sure user doesnt already exist
      try {
        if (user_check.isAdmin) {
          const color = await Color.findByIdAndUpdate(
            id,
            {
              $set: updates,
            },
            { new: true }
          );
          return {
            ...color._doc,
            id: color._id,
            message: "Color is updated successfully.",
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

    //delete color
    async deleteColor(_, { id }, context) {
      const user = checkAuth(context);

      try {
        const color = await Color.findById(id);
        if (user.isAdmin) {
          await color.delete();
          return { message: "Color deleted successfully", success: true };
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
