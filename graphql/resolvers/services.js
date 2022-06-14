const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Service = require("../../models/Service");

const SellerServiceImageResolver = require("./seller_service_image_resolvers");

module.exports = {
  Query: {
    async getSellerServices(parent, args, context) {
      try {
        const service = await Service.find().sort({
          createdAt: -1,
        });

        return service;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getSellerService(_, { id }, context) {
      try {
        const service = await Service.findById(id);
        if (service) {
          return service;
        } else {
          throw new Error("Service not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  // Upload: GraphQLUpload,

  Mutation: {
    //create seller service
    createSellerService: (
      _,
      { user_id, input: { name, description, file, bucketName } },
      context
    ) =>
      new SellerServiceImageResolver().createSellerService(
        user_id,
        name,
        description,
        file,
        bucketName,
        context
      ),

    //update seller service
    async updateSellerService(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id } = args;
      const { name, description } = args.input;

      const updates = {};

      if (name !== undefined) {
        updates.name = name;
      }

      if (description !== undefined) {
        updates.description = description;
      }

      // TODO: Make sure user doesnt already exist
      try {
        // if (user_check.isAdmin) {
        const service = await Service.findByIdAndUpdate(
          id,
          {
            $set: updates,
          },
          { new: true }
        );
        return {
          ...service._doc,
          id: service._id,
          message: "Service is updated successfully.",
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

    //update seller service image
    updateSellerServiceImage: (_, { id, file, bucketName }, context) =>
      new SellerServiceImageResolver().updateSellerServiceImage(
        id,
        file,
        bucketName,
        context
      ),

    //delete seller service
    deleteSellerService: (_, { id, pic_name, bucketName }) =>
      new SellerServiceImageResolver().deleteSellerService(
        id,
        pic_name,
        bucketName
      ),
  },
};
