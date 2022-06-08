const s3 = require("../../util/config");
const { promisify } = require("util");
const { extname } = require("path");
const { UserInputError, AuthenticationError } = require("apollo-server");
const ProductCategory = require("../../models/ProductCategory");
const checkAuth = require("../../util/check-auth");

const sharp = require("sharp");
const { finished } = require("stream");

// Defining finishedAsync method
const finishedAsync = promisify(finished);

class CategoryImageResolver {
  constructor() {
    this.s3 = s3;
  }

  //create product category and upload category pic.
  async createProductCategory(name, file, bucketName, context) {
    const params = {
      Bucket: bucketName,
      Key: "",
      Body: "",
      //   ACL: "public-read",
    };

    const user_check = checkAuth(context);

    try {
      if (user_check.isAdmin) {
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

            params.Key = `category_images/${web_file_name}`;

            let upload = promisify(this.s3.upload.bind(this.s3));

            let result = await upload(params).catch(console.log);

            const newCategory = new ProductCategory({
              name,
              image: params.Key,
            });

            const res = await newCategory.save();

            require("fs").unlinkSync(web_file_name);

            return {
              ...res._doc,
              id: res._id,
              message: "Category is created successfully.",
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
      } else {
        throw new AuthenticationError("Action not allowed");
      }
    } catch (err) {
      throw new UserInputError("Errors occcur while updating");
    }
  }

  //update product category pic.
  async updateProductCategoryImage(id, file, bucketName, context) {
    const params = {
      Bucket: bucketName,
      Key: "",
      Body: "",
      //   ACL: "public-read",
    };

    const user_check = checkAuth(context);

    try {
      if (user_check.isAdmin) {
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

            params.Key = `category_images/${web_file_name}`;

            let upload = promisify(this.s3.upload.bind(this.s3));

            let result = await upload(params).catch(console.log);

            const cat_image = await ProductCategory.findByIdAndUpdate(
              id,
              {
                $set: { image: params.Key },
              },
              { new: true }
            );

            require("fs").unlinkSync(web_file_name);

            return {
              ...cat_image._doc,
              id: cat_image._id,
              message: "Category image is updated successfully.",
              success: true,
            };
          } else {
            return {
              ...cat_image._doc,
              id: cat_image._id,
              message: "Please select jpg/jpeg/png image.",
              success: false,
            };
          }
        } else {
          return {
            ...cat_image._doc,
            id: cat_image._id,
            message: "Please select an image.",
            success: false,
          };
        }
      } else {
        throw new AuthenticationError("Action not allowed");
      }
    } catch (err) {
      throw new UserInputError("Errors occcur while updating");
    }
  }

  //upload cover pic.
  //   async uploadCoverImage(email, file, bucketName) {
  //     const params = {
  //       Bucket: bucketName,
  //       Key: "",
  //       Body: "",
  //     };

  //     try {
  //       //if (email === user_check.email) {
  //       if (file !== undefined) {
  //         let { createReadStream, filename } = await file;

  //         let fileStream = createReadStream();

  //         fileStream.on("error", (error) => console.error(error));

  //         params.Body = fileStream;

  //         let timestamp = new Date().getTime();

  //         let file_extension = extname(filename);

  //         if (
  //           file_extension.toLowerCase() === ".jpg" ||
  //           file_extension.toLowerCase() === ".png" ||
  //           file_extension.toLowerCase() === ".jpeg"
  //         ) {
  //           params.Key = `users_pictures/${timestamp}${file_extension}`;

  //           let upload = promisify(this.s3.upload.bind(this.s3));

  //           let result = await upload(params).catch(console.log);

  //           const pro_pic = await User.findOneAndUpdate(
  //             { email: email },
  //             {
  //               $set: { cover_image: params.Key },
  //             },
  //             { new: true }
  //           );
  //           return {
  //             key: params.Key,
  //             //   url: result.Location,
  //             message: "Cover picture uploaded successfully",
  //             success: true,
  //           };
  //         } else {
  //           return {
  //             key: params.Key,
  //             //   url: result.Location,
  //             message: "Please select jpg/jpeg/png image",
  //             success: false,
  //           };
  //         }
  //       } else {
  //         return {
  //           key: params.Key,
  //           //   url: result.Location,
  //           message: "Please select an image",
  //           success: false,
  //         };
  //       }
  //       // } else {
  //       //   throw new AuthenticationError("Action not allowed");
  //       // }
  //     } catch (err) {
  //       throw new UserInputError("Errors occcur while updating");
  //     }
  //   }
}

module.exports = CategoryImageResolver;
