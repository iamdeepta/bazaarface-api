const {
  UserInputError,
  AuthenticationError,
  toApolloError,
} = require("apollo-server");
const dotenv = require("dotenv");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Onboard = require("../../models/Onboard");
const Product = require("../../models/Product");

const OnboardImageResolver = require("./onboard_image_resolvers");

module.exports = {
  Query: {
    async getOnboards(parent, args, context) {
      try {
        const onboard = await Onboard.find().sort({
          createdAt: -1,
        });

        return onboard;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getOnboard(_, { id }, context) {
      try {
        const onboard = await Onboard.findById(id);
        if (onboard) {
          return onboard;
        } else {
          throw new Error("Onboard not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  // Upload: GraphQLUpload,

  Mutation: {
    //create onboard
    createOnboard: (
      _,
      { input: { title, description, file, bucketName } },
      context
    ) =>
      new OnboardImageResolver().createOnboard(
        title,
        description,
        file,
        bucketName,
        context
      ),

    //update onboard
    async updateOnboard(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id } = args;
      const { title, description } = args.input;

      const updates = {};

      if (title !== undefined) {
        updates.title = title;
      }

      if (description !== undefined) {
        updates.description = description;
      }

      // TODO: Make sure user doesnt already exist
      try {
        if (user_check.isAdmin) {
          const updatedOnboard = await Onboard.findByIdAndUpdate(
            id,
            {
              $set: updates,
            },
            { new: true }
          );
          return {
            ...updatedOnboard._doc,
            id: updatedOnboard._id,
            message: "Onboard is updated successfully.",
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

    //update onboard image
    updateOnboardImage: (_, { id, file, bucketName }, context) =>
      new OnboardImageResolver().updateOnboardImage(
        id,
        file,
        bucketName,
        context
      ),

    //delete onboard
    async deleteOnboard(_, { id }, context) {
      const user = await checkAuth(context);

      try {
        const onboard = await Onboard.findById(id);
        if (user.isAdmin) {
          await onboard.delete();
          return { message: "Onboard deleted successfully", success: true };
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
