const s3 = require("../../util/config");
const { promisify } = require("util");
const { extname } = require("path");
const { UserInputError, AuthenticationError } = require("apollo-server");
const User = require("../../models/User");
const Seller = require("../../models/Seller");
const Buyer = require("../../models/Buyer");

const sharp = require("sharp");
const { finished } = require("stream");

// Defining finishedAsync method
const finishedAsync = promisify(finished);

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

        let file_extension = extname(filename);

        if (
          file_extension.toLowerCase() === ".jpg" ||
          file_extension.toLowerCase() === ".png" ||
          file_extension.toLowerCase() === ".jpeg"
        ) {
          let timestamp = new Date().getTime();
          var web_file_name = `${timestamp}.webp`;

          //upload file to project folder
          const out = require("fs").createWriteStream(filename);
          fileStream.pipe(out);
          await finishedAsync(fileStream);

          //convert to webp
          const sharp_webp = await sharp(filename)
            .toFile(web_file_name)
            .then((data) => {
              require("fs").unlinkSync(filename);

              console.log(data);
            })
            .catch((err) => {
              console.log(err);
            });

          fileStream = require("fs").createReadStream(web_file_name);

          fileStream.on("error", (error) => console.error(error));

          params.Body = fileStream;

          params.Key = `users_pictures/${web_file_name}`;

          let upload = promisify(this.s3.upload.bind(this.s3));

          let result = await upload(params).catch(console.log);

          const pro_pic = await User.findOneAndUpdate(
            { email: email },
            {
              $set: { profile_image: params.Key },
            },
            { new: true }
          );

          if (pro_pic) {
            const seller_user_id = pro_pic._id.toString();
            const pro_pic_seller = await Seller.findOneAndUpdate(
              { user_id: seller_user_id },
              {
                $set: { profile_image: params.Key },
              },
              { new: true }
            );

            const buyer_user_id = pro_pic._id.toString();
            const pro_pic_buyer = await Buyer.findOneAndUpdate(
              { user_id: buyer_user_id },
              {
                $set: { profile_image: params.Key },
              },
              { new: true }
            );
          }

          require("fs").unlinkSync(web_file_name);

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

        let file_extension = extname(filename);

        if (
          file_extension.toLowerCase() === ".jpg" ||
          file_extension.toLowerCase() === ".png" ||
          file_extension.toLowerCase() === ".jpeg"
        ) {
          let timestamp = new Date().getTime();
          var web_file_name = `${timestamp}.webp`;

          //upload file to project folder
          const out = require("fs").createWriteStream(filename);
          fileStream.pipe(out);
          await finishedAsync(fileStream);

          //convert to webp
          const sharp_webp = await sharp(filename)
            .toFile(web_file_name)
            .then((data) => {
              require("fs").unlinkSync(filename);

              console.log(data);
            })
            .catch((err) => {
              console.log(err);
            });

          fileStream = require("fs").createReadStream(web_file_name);

          fileStream.on("error", (error) => console.error(error));

          params.Body = fileStream;

          params.Key = `users_pictures/${web_file_name}`;

          let upload = promisify(this.s3.upload.bind(this.s3));

          let result = await upload(params).catch(console.log);

          const pro_pic = await User.findOneAndUpdate(
            { email: email },
            {
              $set: { cover_image: params.Key },
            },
            { new: true }
          );

          if (pro_pic) {
            const sellers_user_id = pro_pic._id.toString();
            const pro_pic_seller = await Seller.findOneAndUpdate(
              { user_id: sellers_user_id },
              {
                $set: { cover_image: params.Key },
              },
              { new: true }
            );

            const buyers_user_id = pro_pic._id.toString();
            const pro_pic_buyer = await Buyer.findOneAndUpdate(
              { user_id: buyers_user_id },
              {
                $set: { cover_image: params.Key },
              },
              { new: true }
            );
          }

          require("fs").unlinkSync(web_file_name);

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
