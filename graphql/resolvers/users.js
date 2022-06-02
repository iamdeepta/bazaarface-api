const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError, AuthenticationError } = require("apollo-server");
const dotenv = require("dotenv");

dotenv.config();

var nodemailer = require("nodemailer");

const {
  validateRegisterInput,
  validateLoginInput,
  validateUserUpdateInput,
} = require("../../util/validators");
const checkAuth = require("../../util/check-auth");
//const { SECRET_KEY } = require("../../config");
const User = require("../../models/User");
//const passport = require("passport");
//const OAuth2Strategy = require("passport-oauth2");

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
      //   username: user.username,
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
      const user = checkAuth(context);
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
      const user_check = checkAuth(context);
      try {
        const user = await User.findById(userId);
        if (user) {
          if (userId === user_check.id || user_check.isAdmin) {
            return user;
          } else {
            throw new AuthenticationError("Action not allowed");
          }
        } else {
          throw new Error("User not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
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
      if (!valid) {
        throw new UserInputError("Errors", { errors });
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
        //createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },

    //update user
    async updateUser(
      _,
      {
        updateUserInput: {
          id,
          firstname,
          lastname,
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
        },
      },
      context
    ) {
      const user_check = checkAuth(context);
      // Validate user data
      const { valid, errors } = validateUserUpdateInput(
        firstname,
        lastname,
        country_code,
        phone,
        company_name,
        company_website,
        country,
        city,
        profile_image,
        cover_image
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      // TODO: Make sure user doesnt already exist
      try {
        if (id === user_check.id || user_check.isAdmin) {
          const updatedUser = await User.findByIdAndUpdate(
            id,
            {
              $set: {
                firstname,
                lastname,
                country_code,
                phone,
                company_name,
                company_website,
                country,
                city,
                profile_image,
                cover_image,
              },
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
        throw new UserInputError("Errors", { errors });
      }
    },

    //send otp
    getSignupOtp(_, { email, otp }) {
      if (email.trim() === "") {
        throw new Error("Email must not be empty");
      } else {
        const regEx =
          /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if (!email.match(regEx)) {
          throw new Error("Email must be a valid email address");
        }
      }
      if (otp.trim() === "") {
        throw new Error("OTP must be provided");
      }

      sendEmail(otp, email);
    },

    //delete user
    async deleteUser(_, { userId }, context) {
      const user = checkAuth(context);

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
