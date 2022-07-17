const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");
const AdImageResolver = require("./ad_image_resolvers");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Ad = require("../../models/Ad");
const User = require("../../models/User");
const Seller = require("../../models/Seller");
const Buyer = require("../../models/Buyer");
const Country = require("../../models/Country");
const AdType = require("../../models/AdType");

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

    //ten ads
    async getTenAds(parent, args, context) {
      try {
        const ad = await Ad.find()
          .sort({
            createdAt: -1,
          })
          .limit(10);

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

    //ad detail
    async getAdDetail(_, { id }, context) {
      try {
        const ad = await Ad.findOne({ _id: id });
        const user = await User.findOne({ _id: ad.user_id });
        const country = await Country.findOne({ _id: ad.country });
        if (ad && user) {
          var seller;
          var buyer;
          if (user.user_type === "Seller") {
            seller = await Seller.findOne({ user_id: ad.user_id });
          } else {
            buyer = await Buyer.findOne({ user_id: ad.user_id });
          }

          if (buyer === undefined) {
            return {
              ...ad._doc,
              id: ad._id,
              country: country.name,
              user: {
                firstname: user.firstname,
                lastname: user.lastname,
                company_name: user.company_name,
                city: user.city,
                profile_image: user.profile_image,
                seller: {
                  profile_image: seller.profile_image,
                },
              },
            };
          } else if (seller === undefined) {
            return {
              ...ad._doc,
              id: ad._id,
              user: {
                firstname: user.firstname,
                lastname: user.lastname,
                company_name: user.company_name,
                city: user.city,
                country: user.country,
                profile_image: user.profile_image,
                phone: user.phone,
                buyer: {
                  profile_image: buyer.profile_image,
                  designation: buyer.designation,
                },
              },
            };
          }
        } else {
          throw new Error("Ad not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    //get more like this ad
    async getAdMoreLikeThis(_, { category_id }, context) {
      try {
        const ad = await Ad.aggregate([
          { $match: { category: category_id } },
          { $addFields: { type: { $toObjectId: "$type" } } },
          {
            $lookup: {
              from: "adtypes",
              localField: "type",
              foreignField: "_id",
              as: "adtypes",
            },
          },
        ]);

        if (ad) {
          return ad;
        } else {
          throw new Error("Ad not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    //filter ad
    async getAdFilter(
      _,
      {
        category_id,
        ad_for,
        sort_by,
        user_type,
        type,
        country,
        search_text,
        limit,
      },
      context
    ) {
      var updates = {};
      var sorts = {};

      if (category_id !== "" && category_id !== undefined) {
        updates.category = category_id;
      }
      if (ad_for !== "" && ad_for !== undefined) {
        updates.ad_for = ad_for;
      }
      if (user_type !== "" && user_type !== undefined) {
        updates.user_type = user_type;
      }
      if (type !== "" && type !== undefined) {
        updates.type = type;
      }
      if (country !== "" && country !== undefined) {
        updates.country = country;
      }

      if (sort_by !== "" && sort_by !== undefined) {
        if (sort_by === "price_high") {
          sorts.price = -1;
        } else if (sort_by === "price_low") {
          sorts.price = 1;
        } else if (sort_by === "date_new") {
          sorts.createdAt = -1;
        } else if (sort_by === "date_old") {
          sorts.createdAt = 0;
        }
      } else {
        sorts.createdAt = -1;
      }

      try {
        var ad;
        var ads = [];
        if (search_text !== undefined && search_text !== "") {
          ad = await Ad.aggregate([
            { $match: { $text: { $search: search_text } } },
            {
              $addFields: {
                type: { $toObjectId: "$type" },
                user_id: { $toObjectId: "$user_id" },
                users_id: { $toString: "$user_id" },
              },
            },
            {
              $lookup: {
                from: "adtypes",
                localField: "type",
                foreignField: "_id",
                as: "adtypes",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "users",
              },
            },
            {
              $lookup: {
                from: "sellers",
                localField: "users_id",
                foreignField: "user_id",
                as: "sellers",
              },
            },
            {
              $lookup: {
                from: "buyers",
                localField: "users_id",
                foreignField: "user_id",
                as: "buyers",
              },
            },
          ])
            .sort(sorts)
            .limit(limit);
        } else {
          ad = await Ad.aggregate([
            { $match: updates },
            {
              $addFields: {
                type: { $toObjectId: "$type" },
                user_id: { $toObjectId: "$user_id" },
                users_id: { $toString: "$user_id" },
              },
            },
            {
              $lookup: {
                from: "adtypes",
                localField: "type",
                foreignField: "_id",
                as: "adtypes",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "users",
              },
            },
            {
              $lookup: {
                from: "sellers",
                localField: "users_id",
                foreignField: "user_id",
                as: "sellers",
              },
            },
            {
              $lookup: {
                from: "buyers",
                localField: "users_id",
                foreignField: "user_id",
                as: "buyers",
              },
            },
          ])
            .sort(sorts)
            .limit(limit);
        }

        if (ad) {
          for (var i = 0; i < ad.length; i++) {
            ads.push({ ...ad[i], id: ad[i]._id });
          }
          return ads;
        } else {
          throw new Error("Ad not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    //get total ads
    async getTotalAd(parent, data, context) {
      const user = await checkAuth(context);
      try {
        const ads = await Ad.find();
        if (user.isAdmin) {
          return ads.length;
        } else {
          throw new AuthenticationError("Action not allowed");
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
      const user_check = await checkAuth(context);
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
