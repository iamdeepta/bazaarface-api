const s3 = require("../../util/config");
const { promisify } = require("util");
const { extname } = require("path");
const { UserInputError, AuthenticationError } = require("apollo-server");
const Testimonial = require("../../models/Testimonial");
const checkAuth = require("../../util/check-auth");

const sharp = require("sharp");
const { finished } = require("stream");

// Defining finishedAsync method
const finishedAsync = promisify(finished);

//webp.grant_permission();

class TestimonialImageResolver {
  constructor() {
    this.s3 = s3;
  }

  //create testimonial and upload testimonial pic.
  async createTestimonial(
    name,
    comment,
    designation,
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
      if (user_check.isAdmin) {
        if (
          file !== undefined ||
          name.trim() !== "" ||
          comment.trim() !== "" ||
          designation.trim() !== ""
        ) {
          let { createReadStream, filename } = await file;

          let fileStream = createReadStream();

          //   let timestamp = new Date().getTime();

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

            params.Key = `testimonial_images/${web_file_name}`;

            let upload = promisify(this.s3.upload.bind(this.s3));

            let result = await upload(params).catch(console.log);

            const newTesti = new Testimonial({
              name,
              comment,
              designation,
              image: params.Key,
            });

            const res = await newTesti.save();

            require("fs").unlinkSync(web_file_name);

            return {
              ...res._doc,
              id: res._id,
              message: "Testimonial is created successfully.",
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

  //update testimonial pic.
  async updateTestimonialImage(id, file, bucketName, context) {
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

            params.Key = `testimonial_images/${web_file_name}`;

            let upload = promisify(this.s3.upload.bind(this.s3));

            let result = await upload(params).catch(console.log);

            const testi_image = await Testimonial.findByIdAndUpdate(
              id,
              {
                $set: { image: params.Key },
              },
              { new: true }
            );

            require("fs").unlinkSync(web_file_name);

            return {
              ...testi_image._doc,
              id: testi_image._id,
              message: "Image is updated successfully.",
              success: true,
            };
          } else {
            return {
              ...testi_image._doc,
              id: testi_image._id,
              message: "Please select jpg/jpeg/png image.",
              success: false,
            };
          }
        } else {
          return {
            ...testi_image._doc,
            id: testi_image._id,
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
}

module.exports = TestimonialImageResolver;
