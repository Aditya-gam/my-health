// index.js
import dotenv from "dotenv";
import express from "express";
import path from "path";
import bodyParser from "body-parser";
import routes from "./routes/index";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;
// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to enable CORS
app.use(cors());

// Serve static files from the assets folder
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Use the routes defined in the routes folder
app.use("/api", routes);

try {
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("Error during server startup:", error);
}
