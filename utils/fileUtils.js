// utils/fileUtils.js
const fs = require("fs");

// Function to read a file and return its bytes
function readFileBytes(filePath) {
  try {
    return fs.readFileSync(filePath);
  } catch (error) {
    console.error(`Error reading file from path ${filePath}:`, error);
    throw error;
  }
}

// Function to save structured data to a JSON file
function saveToJsonFile(data, jsonFilePath) {
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`Structured data converted to JSON and saved to ${jsonFilePath}`);
  } catch (error) {
    console.error("Error saving JSON:", error);
    throw error;
  }
}

// Function to read a JSON file and return its content as an object
function readJsonFile(jsonFilePath) {
  try {
    const data = fs.readFileSync(jsonFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading JSON file from path ${jsonFilePath}:`, error);
    throw error;
  }
}

function removeSpecialCharacters(text) {
  // Replace \n sequences with a space
  let cleanedText = text.replace(/\n+/g, ' '); // Replace \n with a space

  // Regular expression to match special characters (excluding basic punctuation, letters, numbers, and whitespace)
  const regex = /[^\w\s.,-:]+/g;

  // Replace special characters with an empty string
  cleanedText = cleanedText.replace(regex, '');

  return cleanedText;
}

module.exports = {
  readFileBytes,
  saveToJsonFile,
  readJsonFile,
  removeSpecialCharacters,
};
