const s3 = require("../../util/config");
const { promisify } = require("util");
const { extname } = require("path");
const { UserInputError, AuthenticationError } = require("apollo-server");
const Ad = require("../../models/Ad");
const BuyerActivities = require("../../models/BuyerActivity");

const sharp = require("sharp");
const { finished } = require("stream");
const { trusted } = require("mongoose");

// Defining finishedAsync method
const finishedAsync = promisify(finished);

class AdImageResolver {
  constructor() {
    this.s3 = s3;
  }

  //create ad.
  async createAd(
    user_id,
    user_type,
    name,
    description,
    phone,
    location,
    quantity,
    category,
    country,
    price,
    type,
    ad_for,
    files,
    bucketName
  ) {
    const params = {
      Bucket: bucketName,
      Key: "",
      Body: "",
    };

    let objects = [];
    let images = [];

    try {
      //if (email === user_check.email) {

      if (
        files !== undefined &&
        user_id.trim() !== "" &&
        user_type.trim() !== "" &&
        name.trim() !== "" &&
        description.trim() !== "" &&
        phone.trim() !== "" &&
        location.trim() !== "" &&
        quantity.trim() !== "" &&
        category.trim() !== "" &&
        country.trim() !== "" &&
        price.trim() !== "" &&
        type.trim() !== "" &&
        ad_for.trim() !== "" &&
        files.length <= 5
      ) {
        for (let i = 0; i < files.length; i++) {
          let file = files[i];
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

            params.Key = `ads/${web_file_name}`;

            let upload = promisify(this.s3.upload.bind(this.s3));

            let result = await upload(params).catch(console.log);

            // const pro_pic = await Seller.findOneAndUpdate(
            //   { user_id: id },
            //   {
            //     $push: {
            //       ref_customers: { $each: [params.Key], $position: 0 },
            //     },
            //   }
            // );
            images.push(params.Key);

            require("fs").unlinkSync(web_file_name);

            // objects.push({
            //   message: "Reference customer added successfully",
            //   success: true,
            // });
          } else {
            objects.push({
              //   ...pro_pic._doc,
              //   url: result.Location,
              message: "Please select jpg/jpeg/png image",
              success: false,
            });
          }
        }

        const ad = new Ad({
          user_id,
          user_type,
          name,
          description,
          phone,
          location,
          quantity,
          category,
          country,
          price,
          type,
          ad_for,
          image: images,
        });

        //console.log(product);

        const res = await ad.save();

        //send activity
        if (res && user_type === "Buyer") {
          var res_id = res._id.toString();
          const activity = new BuyerActivities({
            type: "ad",
            user_id: user_id,
            user_type: user_type,
            ad_id: res_id,
            text: "You have uploaded an ad",
          });

          const res_act = await activity.save();
        }

        return {
          ...res._doc,
          id: res._id,
          message: "Ad created successfully",
          success: true,
        };
      } else {
        return {
          //   ...res._doc,
          message: "Please fill up all fields with 5 images max",
          success: false,
        };
      }

      // } else {
      //   throw new AuthenticationError("Action not allowed");
      // }
    } catch (err) {
      throw new UserInputError("Errors occcur while creating");
    }

    //return objects;
  }

  //update ad image
  async updateAdImage(id, pic_name, file, bucketName) {
    const params = {
      Bucket: bucketName,
      Key: "",
      Body: "",
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

          params.Key = `ads/${web_file_name}`;

          let upload = promisify(this.s3.upload.bind(this.s3));

          let result = await upload(params).catch(console.log);

          const ad = await Ad.updateOne(
            { _id: id, image: pic_name },
            {
              $set: { "image.$": params.Key },
            },
            { new: true }
          );

          require("fs").unlinkSync(web_file_name);

          return {
            // ...pro_pic._doc,
            //   url: result.Location,
            message: "Image updated successfully",
            success: true,
          };
        } else {
          return {
            // ...pro_pic._doc,
            //   url: result.Location,
            message: "Please select jpg/jpeg/png image",
            success: false,
          };
        }
      } else {
        return {
          //   ...pro_pic._doc,
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

  //delete ad
  async deleteAdImage(id, pic_name, bucketName) {
    // create an object to hold the name of the bucket, and the key of an object.
    const params = {
      Bucket: bucketName,
      Delete: {
        Objects: [],
      },
    };

    try {
      // Loop through all the object keys sent pushing them to the params object.
      pic_name.forEach((objectKey) =>
        params.Delete.Objects.push({
          Key: objectKey,
        })
      );

      // promisify the deleteObjects() function so that we can use the async/await syntax.
      let removeObjects = promisify(this.s3.deleteObjects.bind(this.s3));

      // remove the objects.
      await removeObjects(params).catch(console.log);

      const ad = await Ad.deleteOne({ _id: id });

      // send back a response to the client.
      return {
        message: "Ad successfully deleted.",
        success: true,
      };
    } catch (err) {
      throw new UserInputError("Errors occcur while deleting");
    }
  }
}

module.exports = AdImageResolver;
