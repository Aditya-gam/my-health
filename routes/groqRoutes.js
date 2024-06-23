// routes/groqRoutes.js
const express = require('express');
const path = require('path');
const { processAndSaveTransformedJsonGroq } = require('../services/groqServices');

const router = express.Router();

// Endpoint to transform JSON using GROQ
router.post('/transform', async (req, res) => {
  try {
    const { inputFilePath } = req.body;

    if (!inputFilePath) {
      return res.status(400).json({ error: 'Input file path is required' });
    }

    // Define output path for transformed JSON
    const outputFilePath = path.join(__dirname, '..', 'outputs', 'json', `structured_output_final_${Date.now()}.json`);

    // Process and save transformed JSON
    await processAndSaveTransformedJsonGroq(path.join(__dirname, '..', 'outputs', 'json', inputFilePath), outputFilePath);

    res.status(200).json({ message: 'JSON transformed successfully', outputPath: outputFilePath });
  } catch (error) {
    console.error("Error during JSON transformation:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
