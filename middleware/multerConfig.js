const multer = require('multer');

// Configure Multer storage to store files in memory
const storage = multer.memoryStorage();

// Create the Multer upload middleware
const upload = multer({ storage: storage });

module.exports = upload;
