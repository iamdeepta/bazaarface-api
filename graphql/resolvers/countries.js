const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Country = require("../../models/Country");

module.exports = {
  Query: {
    async getCountries(parent, args, context) {
      try {
        const country = await Country.find().sort({
          createdAt: -1,
        });

        return country;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getCountry(_, { id }, context) {
      try {
        const country = await Country.findById(id);
        if (country) {
          return country;
        } else {
          throw new Error("Country not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  // Upload: GraphQLUpload,

  Mutation: {
    //create country
    async createCountry(_, { input: { name, code } }, context) {
      const user_check = await checkAuth(context);
      try {
        if (user_check.isAdmin) {
          if (name.trim() !== "" || code.trim() !== "") {
            const country = new Country({ name, code });

            const res = await country.save();

            return {
              ...res._doc,
              id: res._id,
              message: "Country is created successfully.",
              success: true,
            };
          } else {
            return {
              ...res._doc,
              id: res._id,
              message: "Country name and code must not be empty.",
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

    //update country
    async updateCountry(parent, args, context, info) {
      const user_check = await checkAuth(context);
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
          const updatedCountry = await Country.findByIdAndUpdate(
            id,
            {
              $set: updates,
            },
            { new: true }
          );
          return {
            ...updatedCountry._doc,
            id: updatedCountry._id,
            message: "Country is updated successfully.",
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

    //delete country
    async deleteCountry(_, { id }, context) {
      const user = await checkAuth(context);

      try {
        const country = await Country.findById(id);
        if (user.isAdmin) {
          await country.delete();
          return { message: "Country deleted successfully", success: true };
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
