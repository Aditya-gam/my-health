// index.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const cors = require('cors'); // Import CORS

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to enable CORS
app.use(cors());

// Serve static files from the assets folder
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Use the routes defined in the routes folder
app.use('/api', routes);

try {
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("Error during server startup:", error);
}
