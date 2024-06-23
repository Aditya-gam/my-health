// config/awsConfig.js
const AWS = require("aws-sdk");

// AWS Configuration
const awsConfig = {
  region: "us-east-1", // Replace with your AWS region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Use environment variables
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Use environment variables
};

AWS.config.update(awsConfig);

module.exports = AWS;
