// routes/textractRoutes.js
const express = require("express");
const path = require("path");
const { readFileBytes, saveToJsonFile } = require("../utils/fileUtils");
const { analyzeDocument } = require("../services/textractService");
const {
  processAndSaveTransformedJsonGroq,
  generateInference,
} = require("../services/groqServices");

const router = express.Router();

// Endpoint to process a specific image
router.post("/textract-analyze-infer", async (req, res) => {
  try {
    const { imagePath } = req.body;

    if (!imagePath) {
      return res.status(400).json({ error: "Image path is required" });
    }

    // Step 1: Analyze the document using Textract
    const imageBytes = readFileBytes(
      path.join(__dirname, "..", "assets", imagePath)
    );
    const structuredData = await analyzeDocument(imageBytes);

    // Save the structured data to a temporary JSON file
    const tempOutputJsonPath = path.join(
      __dirname,
      "..",
      "outputs",
      "json",
      `structured_output_temp_${Date.now()}.json`
    );
    saveToJsonFile(structuredData, tempOutputJsonPath);

    // Step 2: Transform the JSON using GROQ
    const finalOutputJsonPath = path.join(
      __dirname,
      "..",
      "outputs",
      "json",
      `structured_output_final_${Date.now()}.json`
    );
    await processAndSaveTransformedJsonGroq(
      tempOutputJsonPath,
      finalOutputJsonPath
    );

    // Read the final transformed JSON for the response
    // const transformedData = require(finalOutputJsonPath);

    const inferenceOutputJsonPath = path.join(
      __dirname,
      "..",
      "outputs",
      "json",
      `inference_output_${Date.now()}.json`
    );
    await generateInference(finalOutputJsonPath, inferenceOutputJsonPath);

    // Read the final inference JSON for the response
    const inferenceData = require(inferenceOutputJsonPath);  

    // Respond with the final transformed JSON
    res.status(200).json({
      message: "Document analyzed, transformed, and inferred successfully",
      structuredData: require(finalOutputJsonPath).choices[0].message.content,
      Inference: inferenceData.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error during analyze and transform process:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
