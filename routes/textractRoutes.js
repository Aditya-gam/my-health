const path = require("path");
const fs = require("fs");
const express = require("express");
const { analyzeDocument } = require("../services/textractService");
const {
  redactMedicalInfo,
} = require("../services/awsMedicalComprehendServices");
const { generateInference } = require("../services/groqServices");
const {
  removeSpecialCharacters,
  readFileBytes,
} = require("../utils/fileUtils");
const AWS = require("../config/awsConfig");
const upload = require("../middleware/multerConfig");

const router = express.Router();
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Endpoint to process a specific image
router.post(
  "/textract-analyze-infer",
  upload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
      const { description } = req.body;

      if (!file) {
        return res.status(400).json({ error: "File is required" });
      }

      // Upload file to S3
      const s3Params = {
        Bucket: "recordsafe", // Replace with your bucket name
        Key: file.originalname,
        Body: file.buffer,
      };

      const s3UploadData = await s3.upload(s3Params).promise();
      console.log("Upload Success", s3UploadData.Location);

      // Step 2: Analyze the document using Textract
      const imageBytes = file.buffer;
      const structuredData = await analyzeDocument(imageBytes);

      // Step 3: Redact medical information using Comprehend Medical
      const redactedStructuredData = await redactMedicalInfo(
        structuredData.text
      );
      const cleanedStructuredData = removeSpecialCharacters(
        redactedStructuredData
      );

      // Step 4: Generate the inference
      const inferenceData = await generateInference(cleanedStructuredData);
      const cleanedInference = removeSpecialCharacters(
        inferenceData.choices[0].message.content
      );

      // Step 5: Save metadata to DynamoDB
      const dbParams = {
        TableName: "medical_records", // Replace with your table name
        Item: {
          filename: file.originalname,
          s3Location: s3UploadData.Location,
          inference: cleanedInference,
          description: description,
          date_created: Math.floor(Date.now() / 1000), // Unix timestamp (number)
          user_id: "007", // Replace with dynamic user ID if needed
        },
      };

      await dynamoDB.put(dbParams).promise();
      console.log("Metadata saved to DynamoDB");

      // Respond with the final inference and S3 location
      res.status(200).json({
        message: "Document analyzed, transformed, and inferred successfully",
        inference: cleanedInference,
        s3Location: s3UploadData.Location,
      });
    } catch (error) {
      console.error("Error during analyze and transform process:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Endpoint to fetch a file
router.get("/fetch", async (req, res) => {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: "Filename is required" });
  }

  // Get metadata from DynamoDB
  const dbParams = {
    TableName: "medical_records", // Replace with your table name
    Item: {
      filename: file.originalname,
      s3Location: s3UploadData.Location,
      inference: cleanedInference,
      description: description,
      date_created: Math.floor(Date.now() / 1000), // Unix timestamp (number)
      user_id: "007", // Replace with dynamic user ID if needed
    },
  };

  try {
    const dbData = await dynamoDB.get(dbParams).promise();

    if (!dbData.Item) {
      return res.status(404).json({ error: "File not found" });
    }

    const s3Params = {
      Bucket: "recordsafe", // Replace with your bucket name
      Key: file.originalname,
      Body: file.buffer,
    };

    const s3Data = await s3.getObject(s3Params).promise();
    const fileContent = s3Data.Body.toString("base64");

    res.status(200).json({
      metadata: dbData.Item,
      fileContent: fileContent,
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
