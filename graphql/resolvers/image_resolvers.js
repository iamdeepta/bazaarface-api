const s3 = require("../../util/config");
const { promisify } = require("util");
const { extname } = require("path");
const { UserInputError, AuthenticationError } = require("apollo-server");
const User = require("../../models/User");

class ImageResolver {
  constructor() {
    this.s3 = s3;
  }

  //upload profile pic.
  async uploadObject(email, file, bucketName) {
    const params = {
      Bucket: bucketName,
      Key: "",
      Body: "",
      //   ACL: "public-read",
    };

    try {
      //if (email === user_check.email) {
      if (file !== undefined) {
        let { createReadStream, filename } = await file;

        let fileStream = createReadStream();

        fileStream.on("error", (error) => console.error(error));

        params.Body = fileStream;

        let timestamp = new Date().getTime();

        let file_extension = extname(filename);

        if (
          file_extension.toLowerCase() === ".jpg" ||
          file_extension.toLowerCase() === ".png" ||
          file_extension.toLowerCase() === ".jpeg"
        ) {
          params.Key = `users_pictures/${timestamp}${file_extension}`;

          let upload = promisify(this.s3.upload.bind(this.s3));

          let result = await upload(params).catch(console.log);

          const pro_pic = await User.findOneAndUpdate(
            { email: email },
            {
              $set: { profile_image: params.Key },
            },
            { new: true }
          );
          return {
            key: params.Key,
            //   url: result.Location,
            message: "Profile picture uploaded successfully",
            success: true,
          };
        } else {
          return {
            key: params.Key,
            //   url: result.Location,
            message: "Please select jpg/jpeg/png image",
            success: false,
          };
        }
      } else {
        return {
          key: params.Key,
          //   url: result.Location,
          message: "Please select an image",
          success: false,
        };
      }
      // } else {
      //   throw new AuthenticationError("Action not allowed");
      // }
    } catch (err) {
      throw new UserInputError("Errors occcur while updating");
    }
  }

  //upload cover pic.
  async uploadCoverImage(email, file, bucketName) {
    const params = {
      Bucket: bucketName,
      Key: "",
      Body: "",
      //   ACL: "public-read",
    };

    try {
      //if (email === user_check.email) {
      if (file !== undefined) {
        let { createReadStream, filename } = await file;

        let fileStream = createReadStream();

        fileStream.on("error", (error) => console.error(error));

        params.Body = fileStream;

        let timestamp = new Date().getTime();

        let file_extension = extname(filename);

        if (
          file_extension.toLowerCase() === ".jpg" ||
          file_extension.toLowerCase() === ".png" ||
          file_extension.toLowerCase() === ".jpeg"
        ) {
          params.Key = `users_pictures/${timestamp}${file_extension}`;

          let upload = promisify(this.s3.upload.bind(this.s3));

          let result = await upload(params).catch(console.log);

          const pro_pic = await User.findOneAndUpdate(
            { email: email },
            {
              $set: { cover_image: params.Key },
            },
            { new: true }
          );
          return {
            key: params.Key,
            //   url: result.Location,
            message: "Cover picture uploaded successfully",
            success: true,
          };
        } else {
          return {
            key: params.Key,
            //   url: result.Location,
            message: "Please select jpg/jpeg/png image",
            success: false,
          };
        }
      } else {
        return {
          key: params.Key,
          //   url: result.Location,
          message: "Please select an image",
          success: false,
        };
      }
      // } else {
      //   throw new AuthenticationError("Action not allowed");
      // }
    } catch (err) {
      throw new UserInputError("Errors occcur while updating");
    }
  }
}

module.exports = ImageResolver;
