const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");
const AdImageResolver = require("./ad_image_resolvers");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Ad = require("../../models/Ad");

module.exports = {
  Query: {
    async getAds(parent, args, context) {
      try {
        const ad = await Ad.find().sort({
          createdAt: -1,
        });

        return ad;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getAd(_, { id }, context) {
      try {
        const ad = await Ad.findOne({ _id: id });
        if (ad) {
          return ad;
        } else {
          throw new Error("Ad not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  // Upload: GraphQLUpload,

  Mutation: {
    //create ad
    createAd: (
      _,
      {
        input: {
          user_id,
          user_type,
          name,
          description,
          phone,
          location,
          quantity,
          category,
          country,
          price,
          type,
          ad_for,
          files,
          bucketName,
        },
      }
    ) =>
      new AdImageResolver().createAd(
        user_id,
        user_type,
        name,
        description,
        phone,
        location,
        quantity,
        category,
        country,
        price,
        type,
        ad_for,
        files,
        bucketName
      ),

    //update ad
    async updateAd(parent, args, context, info) {
      const user_check = checkAuth(context);
      const { id } = args;
      const {
        name,
        description,
        phone,
        location,
        quantity,
        category,
        country,
        price,
        type,
        ad_for,
      } = args.input;

      const updates = {};

      if (name !== undefined) {
        updates.name = name;
      }

      if (description !== undefined) {
        updates.description = description;
      }

      if (phone !== undefined) {
        updates.phone = phone;
      }

      if (location !== undefined) {
        updates.location = location;
      }

      if (quantity !== undefined) {
        updates.quantity = quantity;
      }

      if (category !== undefined) {
        updates.category = category;
      }

      if (country !== undefined) {
        updates.country = country;
      }

      if (price !== undefined) {
        updates.price = price;
      }

      if (type !== undefined) {
        updates.type = type;
      }

      if (ad_for !== undefined) {
        updates.ad_for = ad_for;
      }

      // TODO: Make sure user doesnt already exist
      try {
        // if (user_check.isAdmin) {
        const ad = await Ad.findByIdAndUpdate(
          id,
          {
            $set: updates,
          },
          { new: true }
        );
        return {
          ...ad._doc,
          message: "Ad is updated successfully.",
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

    //update ad image
    updateAdImage: (_, { id, pic_name, file, bucketName }) =>
      new AdImageResolver().updateAdImage(id, pic_name, file, bucketName),

    //delete ad
    deleteAdImage: (_, { id, pic_name, bucketName }) =>
      new AdImageResolver().deleteAdImage(id, pic_name, bucketName),
  },
};
