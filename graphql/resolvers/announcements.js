const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");

dotenv.config();

const checkAuth = require("../../util/check-auth");

const Announcement = require("../../models/Announcement");

const AnnouncementImageResolver = require("./announcement_image_resolvers");

module.exports = {
  Query: {
    async getAnnouncements(parent, args, context) {
      try {
        const testi = await Announcement.find().sort({
          createdAt: -1,
        });

        return testi;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getAnnouncement(_, { id }, context) {
      try {
        const testi = await Announcement.findById(id);
        if (testi) {
          return testi;
        } else {
          throw new Error("Announcement not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  // Upload: GraphQLUpload,

  Mutation: {
    //create Announcement
    createAnnouncement: (
      _,
      { input: { title, semi_title, description, link, file, bucketName } },
      context
    ) =>
      new AnnouncementImageResolver().createAnnouncement(
        title,
        semi_title,
        description,
        link,
        file,
        bucketName,
        context
      ),

    //update Announcement
    async updateAnnouncement(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { id } = args;
      const { title, semi_title, description, link } = args.input;

      const updates = {};

      if (title !== undefined) {
        updates.title = title;
      }

      if (semi_title !== undefined) {
        updates.semi_title = semi_title;
      }

      if (description !== undefined) {
        updates.description = description;
      }

      if (link !== undefined) {
        updates.link = link;
      }

      // TODO: Make sure user doesnt already exist
      try {
        if (user_check.isAdmin) {
          const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            id,
            {
              $set: updates,
            },
            { new: true }
          );
          return {
            ...updatedAnnouncement._doc,
            id: updatedAnnouncement._id,
            message: "Announcement is updated successfully.",
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

    //update Announcement image
    updateAnnouncementImage: (_, { id, file, bucketName }, context) =>
      new AnnouncementImageResolver().updateAnnouncementImage(
        id,
        file,
        bucketName,
        context
      ),

    //delete Announcement
    async deleteAnnouncement(_, { id }, context) {
      const user = await checkAuth(context);

      try {
        const testi = await Announcement.findById(id);
        if (user.isAdmin) {
          await testi.delete();
          return {
            message: "Announcement deleted successfully",
            success: true,
          };
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
