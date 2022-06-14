const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Location = require("../../models/Location");

module.exports = {
  Query: {
    async getSellerLocations(parent, args, context) {
      try {
        const location = await Location.find().sort({
          createdAt: -1,
        });

        return location;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getSellerLocation(_, { id }, context) {
      try {
        const location = await Location.findById(id);
        if (location) {
          return location;
        } else {
          throw new Error("Location not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  // Upload: GraphQLUpload,

  Mutation: {
    //create seller location
    async createSellerLocation(
      _,
      {
        user_id,
        input: {
          office,
          address,
          open_day1,
          open_day2,
          open_time1,
          open_time2,
          map,
        },
      },
      context
    ) {
      //const user_check = await checkAuth(context);
      try {
        //if (user_check.isAdmin) {
        if (office.trim() !== "" || address.trim() !== "") {
          const location = new Location({
            user_id,
            office,
            address,
            open_day1,
            open_day2,
            open_time1,
            open_time2,
            map,
          });

          const res = await location.save();

          return {
            ...res._doc,
            id: res._id,
            message: "Location is created successfully.",
            success: true,
          };
        } else {
          return {
            ...res._doc,
            id: res._id,
            message: "Office and address must not be empty.",
            success: false,
          };
        }
        // } else {
        //   throw new AuthenticationError("Action not allowed");
        // }
      } catch (err) {
        throw new UserInputError("Errors occcur while updating");
      }
    },

    //update seller location
    async updateSellerLocation(parent, args, context, info) {
      //const user_check = await checkAuth(context);
      const { id } = args;
      const {
        office,
        address,
        open_day1,
        open_day2,
        open_time1,
        open_time2,
        map,
      } = args.input;

      const updates = {};

      if (office !== undefined) {
        updates.office = office;
      }

      if (address !== undefined) {
        updates.address = address;
      }

      if (open_day1 !== undefined) {
        updates.open_day1 = open_day1;
      }

      if (open_day2 !== undefined) {
        updates.open_day2 = open_day2;
      }

      if (open_time1 !== undefined) {
        updates.open_time1 = open_time1;
      }

      if (open_time2 !== undefined) {
        updates.open_time2 = open_time2;
      }

      if (map !== undefined) {
        updates.map = map;
      }

      // TODO: Make sure user doesnt already exist
      try {
        //if (user_check.isAdmin) {
        const location = await Location.findByIdAndUpdate(
          id,
          {
            $set: updates,
          },
          { new: true }
        );
        return {
          ...location._doc,
          id: location._id,
          message: "Location is updated successfully.",
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

    //delete location
    async deleteSellerLocation(_, { id }, context) {
      //const user = await checkAuth(context);

      try {
        const location = await Location.findById(id);
        //if (user.isAdmin) {
        await location.delete();
        return { message: "Location deleted successfully", success: true };
        // } else {
        //   throw new AuthenticationError("Action not allowed");
        // }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
