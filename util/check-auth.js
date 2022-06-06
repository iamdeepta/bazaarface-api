const { AuthenticationError } = require("apollo-server");

const jwt = require("jsonwebtoken");
//const { SECRET_KEY } = require("../config");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");

const dotenv = require("dotenv");

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// async function verify(token) {
//   const { payload } = await client.verifyIdToken({
//     idToken: token,
//     audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
//     // Or, if multiple clients access the backend:
//     //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
//   });
//   //const payload = ticket.getPayload();

//   const user_single = await User.findOne({
//     email: payload.email,
//   });

//   return { ...payload, id: user_single.id, isAdmin: user_single.isAdmin };
//   //console.log(payload);
//   //const userid = payload["sub"];
//   // If request specified a G Suite domain:
//   // const domain = payload['hd'];
// }

module.exports = (context) => {
  // context = { ... headers }
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    // Bearer ....
    const token = authHeader.split("Bearer ")[1];

    if (token) {
      try {
        const user = jwt.verify(token, process.env.SECRET_KEY);
        return user;
      } catch (err) {
        throw new AuthenticationError("Invalid/Expired token");
      }
    }
    throw new Error("Authentication token must be 'Bearer [token]");
  }
  throw new Error("Authorization header must be provided");
};
