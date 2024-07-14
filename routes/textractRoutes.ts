import path from "path";
import fs from "fs";
import express, { Request, Response } from "express";
import { analyzeDocument } from "../services/textractService";
import { redactMedicalInfo } from "../services/awsMedicalComprehendServices";
import { generateInference } from "../services/groqServices";
import { removeSpecialCharacters, readFileBytes } from "../utils/fileUtils";
import AWS from "../config/awsConfig";
import upload from "../middleware/multerConfig";
import "../types/express"; // Ensure this is imported to extend the Request interface

const router = express.Router();
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

router.post(
  "/textract-analyze-infer",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const { description } = req.body;

      if (!file) {
        return res.status(400).json({ error: "File is required" });
      }

      const s3Params = {
        Bucket: "recordsafe",
        Key: file.originalname,
        Body: file.buffer,
      };

      const s3UploadData = await s3.upload(s3Params).promise();
      console.log("Upload Success", s3UploadData.Location);

      const imageBytes = file.buffer;
      const structuredData = await analyzeDocument(imageBytes);

      const redactedStructuredData = await redactMedicalInfo(
        structuredData.text
      );
      const cleanedStructuredData = removeSpecialCharacters(
        redactedStructuredData
      );

      const inferenceData = await generateInference(cleanedStructuredData);
      const cleanedInference = removeSpecialCharacters(
        inferenceData.choices[0].message.content
      );

      const dbParams = {
        TableName: "medical_records",
        Item: {
          filename: file.originalname,
          s3Location: s3UploadData.Location,
          inference: cleanedInference,
          description: description,
          date_created: Math.floor(Date.now() / 1000),
          user_id: "007",
        },
      };

      await dynamoDB.put(dbParams).promise();
      console.log("Metadata saved to DynamoDB");

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

router.get("/fetchDynamo", async (req: Request, res: Response) => {
  const dbParams = {
    TableName: "medical_records",
    FilterExpression: "#userid = :userValue",
    ExpressionAttributeNames: {
      "#userid": "user_id",
    },
    ExpressionAttributeValues: {
      ":userValue": "007",
    },
  };
  const output: any[] = [];
  dynamoDB.scan(dbParams, (err, data) => {
    if (err) {
      console.error(
        "Unable to scan the table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.status(500).json({ error: "Internal server error" });
    } else {
      console.log("Scan succeeded.");
      if (data.Items) {
        data.Items.forEach((item) => {
          output.push(item);
        });
      }
      res.status(200).json({
        message: "File fetched successfully",
        metadata: output,
      });
    }
  });
});

export default router;
