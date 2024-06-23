// routes/index.js
const express = require('express');
const textractRoutes = require('./textractRoutes');
const groqRoutes = require('./groqRoutes');

const router = express.Router();

// Use textract routes
router.use('/textract', textractRoutes);

// // Use groq routes
// router.use('/groq', groqRoutes);

module.exports = router;
