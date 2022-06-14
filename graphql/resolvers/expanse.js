const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Expanse = require("../../models/Expanse");

module.exports = {
  Query: {
    async getExpanse(parent, args, context) {
      try {
        const expanse = await Expanse.find().sort({ createdAt: -1 }).limit(1);

        return expanse;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  // Upload: GraphQLUpload,

  Mutation: {
    //create header category
    async createExpanse(
      _,
      { input: { countries, product_sample, companies, business_contacts } },
      context
    ) {
      const user_check = await checkAuth(context);
      try {
        if (user_check.isAdmin) {
          if (countries !== undefined || countries.trim() !== "") {
            const newExpanse = new Expanse({
              countries,
              product_sample,
              companies,
              business_contacts,
            });

            const res = await newExpanse.save();

            return {
              ...res._doc,
              id: res._id,
              message: "Expanse is created successfully.",
              success: true,
            };
          } else {
            return {
              ...res._doc,
              id: res._id,
              message: "Expanse must not be empty.",
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

    //update expanse
    async updateExpanse(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id } = args;
      const { countries, product_sample, companies, business_contacts } =
        args.input;

      const updates = {};

      if (countries !== undefined) {
        updates.countries = countries;
      }

      if (product_sample !== undefined) {
        updates.product_sample = product_sample;
      }

      if (companies !== undefined) {
        updates.companies = companies;
      }

      if (business_contacts !== undefined) {
        updates.business_contacts = business_contacts;
      }

      // TODO: Make sure user doesnt already exist
      try {
        if (user_check.isAdmin) {
          const updatedExpanse = await Expanse.findByIdAndUpdate(
            id,
            {
              $set: updates,
            },
            { new: true }
          );
          return {
            ...updatedExpanse._doc,
            id: updatedExpanse._id,
            message: "Expanse data is updated successfully.",
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
  },
};
