require("dotenv").config();

const aws = require("aws-sdk");

aws.config.update({
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  accessKeyId: process.env.ACCESS_KEY_ID,
  region: process.env.REGION,
});

const s3 = new aws.S3();

module.exports = s3;
