const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError, AuthenticationError } = require("apollo-server");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const ImageResolver = require("./image_resolvers");
//const { GraphQLUpload } = require("graphql-upload");

dotenv.config();

var nodemailer = require("nodemailer");

const {
  validateRegisterInput,
  validateLoginInput,
  validateUserUpdateInput,
  validateRegisterInputMobile,
} = require("../../util/validators");
const checkAuth = require("../../util/check-auth");
//const { SECRET_KEY } = require("../../config");
const User = require("../../models/User");
const Seller = require("../../models/Seller");
const Buyer = require("../../models/Buyer");
const Country = require("../../models/Country");
const Otp = require("../../models/Otp");
//const passport = require("passport");
//const OAuth2Strategy = require("passport-oauth2").Strategy;
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

aws.config.update({
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  accessKeyId: process.env.ACCESS_KEY_ID,
  region: process.env.REGION,
});

const s3 = new aws.S3();

// const region = "us-east-1";
// const bucketName = "files.bazaarface.com";
// const dirName = "users_profile_pic";
// const accessKeyId = process.env.ACCESS_KEY_ID;
// const secretAccessKey = process.env.SECRET_ACCESS_KEY;

// const s3 = new aws.S3({
//   region,
//   accessKeyId,
//   secretAccessKey,
//   signatureVersion: "v4",
// });

// var upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: bucketName + "/" + dirName,
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//       cb(null, Date.now().toString());
//     },
//   }),
// });

function generateToken(user) {
  //    passport.use(
  //     new OAuth2Strategy(
  //       {
  //         authorizationURL: "http://localhost:8000/",
  //         tokenURL: "http://localhost:8000/",
  //         clientID: process.env.SECRET_KEY,
  //         clientSecret: process.env.SECRET_KEY,
  //         callbackURL: "http://localhost:8000/",
  //       },
  //       function (accessToken, refreshToken, user, cb) {
  //         User.find({ id: user.id }, function (err, user) {
  //           return cb(err, user);
  //         });
  //         // console.log(accessToken);
  //         // return accessToken;
  //       }
  //     )
  //   );
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.SECRET_KEY,
    { expiresIn: "5d" }
  );
}

const sendEmail = (otp, user_email) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_ID,
      pass: process.env.GMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  var mailOptions = {
    from: process.env.GMAIL_ID,
    to: user_email,
    subject: "Bazaarface  OTP",
    //   text: `Hi Smartherd, thank you for your nice Node.js tutorials.
    //           I will donate 50$ for this course. Please send me payment options.`,
    html: `<p>Your otp is ${otp}</p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = {
  Query: {
    async getUsers(parent, data, context) {
      const user = await checkAuth(context);
      try {
        const users = await User.find().sort({ createdAt: -1 });
        if (user.isAdmin) {
          return users;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getUser(_, { userId }, context) {
      const user_check = await await checkAuth(context);

      try {
        const user = await User.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(userId) } },
          {
            $addFields: {
              user_id: { $toString: "$_id" },
            },
          },
          {
            $lookup: {
              from: "sellers",
              localField: "user_id",
              foreignField: "user_id",
              as: "sellers",
            },
          },
          {
            $lookup: {
              from: "buyers",
              localField: "user_id",
              foreignField: "user_id",
              as: "buyers",
            },
          },
        ]);

        const country = await Country.findOne({
          _id: user[0].country,
        });
        if (user) {
          if (userId === user_check.id || user_check.isAdmin) {
            return { ...user[0], id: user[0]._id, country: country.name };
          } else {
            throw new AuthenticationError("Action not allowed");
          }
        } else {
          throw new Error("Buyer not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    //get total users
    async getTotalUser(parent, data, context) {
      const user = await checkAuth(context);
      try {
        const users = await User.find();
        if (user.isAdmin) {
          return users.length;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  // Upload: GraphQLUpload,
  Mutation: {
    async login(_, { email, password }) {
      const { errors, valid } = validateLoginInput(email, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const user = await User.findOne({ email });

      //sendEmail("123222", email);

      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("User not found", { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong crendetials";
        throw new UserInputError("Wrong crendetials", { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    async register(
      _,
      {
        registerInput: {
          firstname,
          lastname,
          email,
          password,
          confirmPassword,
          otp,
          country_code,
          phone,
          company_name,
          company_website,
          country,
          city,
          isBuyer,
          isSeller,
          profile_image,
          cover_image,
          isPhone,
        },
      }
    ) {
      // Validate user data
      const { valid, errors } = validateRegisterInput(
        firstname,
        lastname,
        email,
        password,
        confirmPassword,
        otp,
        country_code,
        phone,
        company_name,
        company_website,
        country,
        city,
        profile_image,
        cover_image
      );
      const { valid_mobile, errors_mobile } = validateRegisterInputMobile(
        firstname,
        email,
        password,
        confirmPassword,
        otp,
        phone
      );

      if (isPhone) {
        if (!valid_mobile) {
          throw new UserInputError("Errors", { errors_mobile });
        }
      } else {
        if (!valid) {
          throw new UserInputError("Errors", { errors });
        }
      }
      // TODO: Make sure user doesnt already exist
      const user = await User.findOne({ email });
      if (user) {
        throw new UserInputError("Email already exists", {
          errors: {
            email: "This email is taken",
          },
        });
      }
      // hash password and create an auth token
      password = await bcrypt.hash(password, 12);

      //otp verification
      // const user_otp = await Otp.findOne({ email, otp }).sort({
      //   createdAt: -1,
      // });
      // if (!user_otp) {
      //   throw new UserInputError("You entered wrong otp", {
      //     errors: {
      //       otp: "You entered wrong otp",
      //     },
      //   });
      // }

      const newUser = new User({
        firstname,
        lastname,
        email,
        password,
        confirmPassword,
        otp,
        country_code,
        phone,
        company_name,
        company_website,
        country,
        city,
        isBuyer,
        isSeller,
        profile_image,
        cover_image,
        user_type: isSeller ? "Seller" : "Buyer",
        //createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = generateToken(res);

      if (res) {
        if (res.isSeller === true) {
          const seller = new Seller({
            email: res.email,
            profile_image: res.profile_image,
            cover_image: res.cover_image,
            user_id: res._id,
            user_type: "Seller",
          });

          const res_seller = await seller.save();
        }

        if (res.isBuyer === true) {
          const buyer = new Buyer({
            email: res.email,
            profile_image: res.profile_image,
            cover_image: res.cover_image,
            user_id: res._id,
            user_type: "Buyer",
          });

          const res_buyer = await buyer.save();
        }
      } else {
        throw new Error("Something went wrong. Please try again.");
      }

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },

    //google login/signup
    async googleAuth(
      parent,
      {
        input: {
          idToken,
          user_type,
          isBuyer,
          isSeller,
          country,
          country_code,
          city,
          phone,
          company_website,
        },
      },
      context,
      info
    ) {
      const client_id = process.env.GOOGLE_CLIENT_ID;
      const { payload } = await client.verifyIdToken({
        idToken: idToken,
        audience: client_id,
      });

      //hash pass
      const password = await bcrypt.hash(
        Math.floor(Math.random() * 99999999 + 1).toString(),
        12
      );

      if (payload.email_verified) {
        const user = await User.findOne({
          email: payload.email,
        });
        if (!user) {
          const newUser = new User({
            firstname: payload.name.split(" ")[0],
            lastname: payload.name.split(" ")[1],
            email: payload.email,
            profile_image: payload.picture,
            cover_image: payload.picture,
            otp: "google_auth",
            token: idToken,
            password: password,
            country_code: country_code,
            country: country,
            city: city,
            phone: phone,
            isBuyer,
            isSeller,
            user_type: isSeller ? "Seller" : "Buyer",
            company_name:
              payload.name.split(" ")[0] + " " + payload.name.split(" ")[1],
            company_website,
          });
          const res = await newUser.save();

          if (res) {
            if (res.isSeller === true) {
              const seller = new Seller({
                email: res.email,
                profile_image: res.profile_image,
                cover_image: res.cover_image,
                user_id: res._id,
                user_type: "Seller",
              });

              const res_seller = await seller.save();
            }

            if (res.isBuyer === true) {
              const buyer = new Buyer({
                email: res.email,
                profile_image: res.profile_image,
                cover_image: res.cover_image,
                user_id: res._id,
                user_type: "Buyer",
              });

              const res_buyer = await buyer.save();
            }
          } else {
            throw new Error("Something went wrong. Please try again.");
          }

          return {
            message: "Login successful",
            success: true,
            token: idToken,
          };
        } else {
          return {
            message: "Login successful",
            success: true,
            token: idToken,
          };
        }
      } else {
        return {
          message: "Login unsuccessful. Verify your email first.",
          success: false,
          token: idToken,
        };
      }
    },

    //update user
    async updateUser(parent, args, context, info) {
      const user_check = await checkAuth(context);
      const { userId } = args;
      const {
        firstname,
        lastname,
        country_code,
        phone,
        company_name,
        company_website,
        country,
        city,
        user_type,
        isAdmin,
        isBuyer,
        isSeller,
        profile_image,
        cover_image,
      } = args.updateUserInput;

      const updates = {};

      if (firstname !== undefined) {
        updates.firstname = firstname;
      }
      if (lastname !== undefined) {
        updates.lastname = lastname;
      }
      if (country_code !== undefined) {
        updates.country_code = country_code;
      }
      if (phone !== undefined) {
        updates.phone = phone;
      }
      if (company_name !== undefined) {
        updates.company_name = company_name;
      }
      if (company_website !== undefined) {
        updates.company_website = company_website;
      }
      if (country !== undefined) {
        updates.country = country;
      }
      if (city !== undefined) {
        updates.city = city;
      }
      if (user_type !== undefined) {
        updates.user_type = user_type;
      }
      if (profile_image !== undefined) {
        updates.profile_image = profile_image;
      }
      if (cover_image !== undefined) {
        updates.cover_image = cover_image;
      }
      if (isAdmin !== undefined) {
        updates.isAdmin = isAdmin;
      }
      if (isBuyer !== undefined) {
        updates.isBuyer = isBuyer;
      }
      if (isSeller !== undefined) {
        updates.isSeller = isSeller;
      }

      // Validate user data
      //   const { valid, errors } = validateUserUpdateInput(
      //     firstname,
      //     lastname,
      //     country_code,
      //     phone,
      //     company_name,
      //     company_website,
      //     country,
      //     city,
      //     profile_image,
      //     cover_image
      //   );
      //   if (!valid) {
      //     throw new UserInputError("Errors", { errors });
      //   }

      // TODO: Make sure user doesnt already exist
      try {
        if (userId === user_check.id || user_check.isAdmin) {
          const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
              $set: updates,
            },
            { new: true }
          );
          return {
            ...updatedUser._doc,
            id: updatedUser._id,
            success_message: "User updated successfully.",
          };
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        //throw new UserInputError("Errors", { errors });
        throw new UserInputError("Errors occcur while updating");
      }
    },

    //send otp
    async getSignupOtp(_, { email }) {
      if (email.trim() === "") {
        throw new Error("Email must not be empty");
      } else {
        const regEx =
          /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if (!email.match(regEx)) {
          throw new Error("Email must be a valid email address");
        }
      }
      const otp = Math.floor(111111 + Math.random() * 900000).toString();

      // if (otp.trim() === "") {
      //   throw new Error("OTP must be provided");
      // }

      const send_otp = new Otp({ email: email, otp: otp });
      const res = await send_otp.save();

      if (res) {
        sendEmail(otp, email);
      } else {
        throw new Error("Something went wrong. Try again.");
      }
    },

    //forgot pass otp
    async getForgotOtp(_, { email }) {
      if (email.trim() === "") {
        throw new Error("Email must not be empty");
      } else {
        const regEx =
          /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if (!email.match(regEx)) {
          throw new Error("Email must be a valid email address");
        }
      }

      // if (otp.trim() === "") {
      //   throw new Error("OTP must be provided");
      // }

      try {
        const users = await User.findOne({ email: email });

        if (users) {
          const otp = Math.floor(111111 + Math.random() * 900000).toString();
          const send_otp = new Otp({ email: email, otp: otp });
          const res = await send_otp.save();

          if (res) {
            sendEmail(otp, email);

            return {
              message: "OTP sent to your email.",
              success: true,
            };
          }
        } else {
          return {
            message: "Your email is not registered.",
            success: false,
          };
        }
      } catch (err) {
        throw new UserInputError("Errors occcur while sending OTP");
      }
    },

    //reset password
    async resetPassword(parent, args, context, info) {
      //const user_check = await checkAuth(context);
      //const { userId } = args;
      const { email, password, confirmPassword, otp } = args.input;

      const updates = {};

      if (email !== undefined) {
        updates.email = email;
      }

      //otp verification
      const user_otp = await Otp.findOne({ email, otp }).sort({
        createdAt: -1,
      });
      if (!user_otp) {
        throw new UserInputError("You entered wrong otp", {
          errors: {
            otp: "You entered wrong otp",
          },
        });
      }

      try {
        //if (email === user_check.email) {
        if (password === confirmPassword) {
          const resetPass = await User.findOneAndUpdate(
            { email: email },
            {
              $set: { password: await bcrypt.hash(password, 12) },
            },
            { new: true }
          );
          return {
            message: "Password successfully reset.",
            success: true,
          };
        } else {
          return {
            message: "Passwords did not match.",
            success: false,
          };
        }
        // } else {
        //   throw new AuthenticationError("Action not allowed");
        // }
      } catch (err) {
        //throw new UserInputError("Errors", { errors });
        throw new UserInputError("Errors occcur while updating");
      }
    },

    //confirm forgot otp
    async confirmForgotOtp(parent, args, context, info) {
      //const user_check = await checkAuth(context);
      //const { userId } = args;
      const { email, otp } = args;

      //otp verification
      const user_otp = await Otp.findOne({ email, otp }).sort({
        createdAt: -1,
      });
      if (!user_otp) {
        throw new UserInputError("You entered wrong otp", {
          errors: {
            otp: "You entered wrong otp",
          },
        });
      } else {
        return {
          message: "Otp matched.",
          success: false,
        };
      }
    },

    //upload profile image
    uploadObject: (_, { email, file, bucketName }) =>
      new ImageResolver().uploadObject(email, file, bucketName),

    //upload cover image
    uploadCoverImage: (_, { email, file, bucketName }) =>
      new ImageResolver().uploadCoverImage(email, file, bucketName),

    //delete user
    async deleteUser(_, { userId }, context) {
      const user = await checkAuth(context);

      try {
        const users = await User.findById(userId);
        if (user.isAdmin) {
          await users.delete();
          return "User deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
