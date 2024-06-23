// routes/groqRoutes.js
const express = require('express');
const { processAndSaveTransformedJsonGroq } = require('../services/groqServices');

const router = express.Router();

// Endpoint to transform JSON using GROQ
router.post('/transform', async (req, res) => {
  try {
    const { inputJson } = req.body;

    if (!inputJson) {
      return res.status(400).json({ error: 'Input JSON is required' });
    }

    // Process and transform JSON without saving to file
    const transformedJson = await processAndSaveTransformedJsonGroq(inputJson);

    res.status(200).json({ message: 'JSON transformed successfully', transformedJson });
  } catch (error) {
    console.error("Error during JSON transformation:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
