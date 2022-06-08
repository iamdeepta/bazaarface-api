const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Testimonial = require("../../models/Testimonial");

const TestimonialImageResolver = require("./testimonial_image_resolvers");

module.exports = {
  Query: {
    async getTestimonials(parent, args, context) {
      try {
        const testi = await Testimonial.find().sort({
          createdAt: -1,
        });

        return testi;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getTestimonial(_, { id }, context) {
      try {
        const testi = await Testimonial.findById(id);
        if (testi) {
          return testi;
        } else {
          throw new Error("Testimonial not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  // Upload: GraphQLUpload,

  Mutation: {
    //create testimonial
    createTestimonial: (
      _,
      { input: { name, comment, designation, file, bucketName } },
      context
    ) =>
      new TestimonialImageResolver().createTestimonial(
        name,
        comment,
        designation,
        file,
        bucketName,
        context
      ),

    //update testimonial
    async updateTestimonial(parent, args, context, info) {
      const user_check = checkAuth(context);
      const { id } = args;
      const { name, comment, designation } = args.input;

      const updates = {};

      if (name !== undefined) {
        updates.name = name;
      }

      if (comment !== undefined) {
        updates.comment = comment;
      }

      if (designation !== undefined) {
        updates.designation = designation;
      }

      // TODO: Make sure user doesnt already exist
      try {
        if (user_check.isAdmin) {
          const updatedTestimonial = await Testimonial.findByIdAndUpdate(
            id,
            {
              $set: updates,
            },
            { new: true }
          );
          return {
            ...updatedTestimonial._doc,
            id: updatedTestimonial._id,
            message: "Testimonial is updated successfully.",
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

    //update testimonial image
    updateTestimonialImage: (_, { id, file, bucketName }, context) =>
      new TestimonialImageResolver().updateTestimonialImage(
        id,
        file,
        bucketName,
        context
      ),

    //delete testimonial
    async deleteTestimonial(_, { id }, context) {
      const user = checkAuth(context);

      try {
        const testi = await Testimonial.findById(id);
        if (user.isAdmin) {
          await testi.delete();
          return { message: "Testimonial deleted successfully", success: true };
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
