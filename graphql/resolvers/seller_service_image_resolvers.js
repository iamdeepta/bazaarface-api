const s3 = require("../../util/config");
const { promisify } = require("util");
const { extname } = require("path");
const { UserInputError, AuthenticationError } = require("apollo-server");
const Service = require("../../models/Service");
const checkAuth = require("../../util/check-auth");

const sharp = require("sharp");
const { finished } = require("stream");

// Defining finishedAsync method
const finishedAsync = promisify(finished);

class SellerServiceImageResolver {
  constructor() {
    this.s3 = s3;
  }

  //create seller service.
  async createSellerService(
    user_id,
    name,
    description,
    file,
    bucketName,
    context
  ) {
    const params = {
      Bucket: bucketName,
      Key: "",
      Body: "",
      //   ACL: "public-read",
    };

    const user_check = checkAuth(context);

    try {
      //if (user_check.isAdmin) {
      if (file !== undefined || name.trim() !== "") {
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

          params.Key = `seller_images/services/${web_file_name}`;

          let upload = promisify(this.s3.upload.bind(this.s3));

          let result = await upload(params).catch(console.log);

          const service = new Service({
            user_id,
            name,
            description,
            image: params.Key,
          });

          const res = await service.save();

          require("fs").unlinkSync(web_file_name);

          return {
            ...res._doc,
            id: res._id,
            message: "Service is created successfully.",
            success: true,
          };
        } else {
          return {
            ...res._doc,
            id: res._id,
            message: "Please select jpg/jpeg/png image.",
            success: false,
          };
        }
      } else {
        return {
          ...res._doc,
          id: res._id,
          message: "Please fill up all the fields.",
          success: false,
        };
      }
      //   } else {
      //     throw new AuthenticationError("Action not allowed");
      //   }
    } catch (err) {
      throw new UserInputError("Errors occcur while updating");
    }
  }

  //update seller service image.
  async updateSellerServiceImage(id, file, bucketName, context) {
    const params = {
      Bucket: bucketName,
      Key: "",
      Body: "",
      //   ACL: "public-read",
    };

    const user_check = checkAuth(context);

    try {
      //if (user_check.isAdmin) {
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

          params.Key = `seller_images/services/${web_file_name}`;

          let upload = promisify(this.s3.upload.bind(this.s3));

          let result = await upload(params).catch(console.log);

          const service = await Service.findByIdAndUpdate(
            id,
            {
              $set: { image: params.Key },
            },
            { new: true }
          );

          require("fs").unlinkSync(web_file_name);

          return {
            ...service._doc,
            id: service._id,
            message: "Service image is updated successfully.",
            success: true,
          };
        } else {
          return {
            ...service._doc,
            id: service._id,
            message: "Please select jpg/jpeg/png image.",
            success: false,
          };
        }
      } else {
        return {
          ...service._doc,
          id: service._id,
          message: "Please select an image.",
          success: false,
        };
      }
      //   } else {
      //     throw new AuthenticationError("Action not allowed");
      //   }
    } catch (err) {
      throw new UserInputError("Errors occcur while updating");
    }
  }

  //delete seller service
  async deleteSellerService(id, pic_name, bucketName) {
    // create an object to hold the name of the bucket, and the key of an object.
    const params = {
      Bucket: bucketName,
      Key: pic_name,
    };

    try {
      // promisify the deleteObject() so that we can use the async/await syntax.
      let removeObject = promisify(this.s3.deleteObject.bind(this.s3));

      // remove the object.
      await removeObject(params).catch(console.log);

      const seller = await Service.findById(id);

      await seller.delete();

      // send back a response to the client.
      return {
        message: "Service successfully deleted.",
        success: true,
      };
    } catch (err) {
      throw new UserInputError("Errors occcur while updating");
    }
  }
}

module.exports = SellerServiceImageResolver;
