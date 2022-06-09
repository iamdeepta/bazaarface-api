const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const AdType = require("../../models/AdType");

module.exports = {
  Query: {
    async getAdTypes(parent, args, context) {
      try {
        const adType = await AdType.find().sort({
          createdAt: -1,
        });

        return adType;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getAdType(_, { id }, context) {
      try {
        const adType = await AdType.findById(id);
        if (adType) {
          return adType;
        } else {
          throw new Error("Ad Type not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  // Upload: GraphQLUpload,

  Mutation: {
    //create ad type
    async createAdType(_, { input: { name, price } }, context) {
      const user_check = checkAuth(context);
      try {
        if (user_check.isAdmin) {
          if (name.trim() !== "" || price.toString().trim() !== "") {
            const adType = new AdType({ name, price });

            const res = await adType.save();

            return {
              ...res._doc,
              id: res._id,
              message: "Ad type is created successfully.",
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

    //update ad type
    async updateAdType(parent, args, context, info) {
      const user_check = checkAuth(context);
      const { id } = args;
      const { name, price } = args.input;

      const updates = {};

      if (name !== undefined) {
        updates.name = name;
      }

      if (price !== undefined) {
        updates.price = price;
      }

      // TODO: Make sure user doesnt already exist
      try {
        if (user_check.isAdmin) {
          const adType = await AdType.findByIdAndUpdate(
            id,
            {
              $set: updates,
            },
            { new: true }
          );
          return {
            ...adType._doc,
            id: adType._id,
            message: "Ad type is updated successfully.",
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

    //delete ad type
    async deleteAdType(_, { id }, context) {
      const user = checkAuth(context);

      try {
        const adType = await AdType.findById(id);
        if (user.isAdmin) {
          await adType.delete();
          return { message: "Ad type deleted successfully", success: true };
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
