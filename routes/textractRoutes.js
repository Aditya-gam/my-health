// routes/textractRoutes.js
const express = require("express");
const { readFileBytes } = require("../utils/fileUtils");
const { analyzeDocument } = require("../services/textractService");
const { redactMedicalInfo } = require("../services/awsMedicalComprehendServices");
const {
  processAndSaveTransformedJsonGroq,
  generateInference,
} = require("../services/groqServices");
const { removeSpecialCharacters } = require("../utils/fileUtils");
const path = require("path");

const router = express.Router();

// Endpoint to process a specific image
router.post("/textract-analyze-infer", async (req, res) => {
  try {
    const { imagePath } = req.body;

    if (!imagePath) {
      return res.status(400).json({ error: "Image path is required" });
    }

    // Step 1: Analyze the document using Textract
    const imageBytes = readFileBytes(path.join(__dirname, "..", "assets", imagePath));
    const structuredData = await analyzeDocument(imageBytes);

    // Step 2: Redact medical information using Comprehend Medical
    const redactedStructuredData = await redactMedicalInfo(structuredData.text);
    const cleanedStructuredData = removeSpecialCharacters(redactedStructuredData);

    // Step 2: Transform the JSON using GROQ
    // const transformedJson = await processAndSaveTransformedJsonGroq(redactedStructuredData);
    // const cleanedStructuredData = removeSpecialCharacters(transformedJson.choices[0].message.content);

    // Step 3: Generate the inference
    const inferenceData = await generateInference(cleanedStructuredData);
    const cleanedInference = removeSpecialCharacters(inferenceData.choices[0].message.content);

    // Respond with the final transformed and inferred JSON
    res.status(200).json({
      message: "Document analyzed, transformed, and inferred successfully",
      // structuredData: structuredData.text,
      // redactedStructuredData: redactedStructuredData,
      // transformedJson: cleanedStructuredData,
      inference: cleanedInference,
    });
  } catch (error) {
    console.error("Error during analyze and transform process:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
