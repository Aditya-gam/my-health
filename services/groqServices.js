// services/groqService.js
const axios = require("axios");
const { groqApiKey, groqApiUrl } = require("../config/groqConfig");
const { readJsonFile, saveToJsonFile } = require("../utils/fileUtils");

async function transformJsonUsingGroq(inputJson, prompt) {
  try {
    const data = JSON.stringify({
      "messages": [
        {
          "role": "user",
          "content": prompt
        }
      ],
      "model": "mixtral-8x7b-32768"
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: groqApiUrl,
      headers: { 
        'Authorization': `Bearer ${groqApiKey}`, 
        'Content-Type': 'application/json'
      },
      data: data
    };

    const response = await axios.request(config);

    return response.data;
  } catch (error) {
    console.error("Error calling GROQ API:", error);
    throw error;
  }
}

async function processAndSaveTransformedJsonGroq(inputFilePath, outputFilePath) {
  try {
    // Read the input JSON file
    const inputData = readJsonFile(inputFilePath);

    // Create the prompt for GROQ API
    const prompt = `Please structure and beautify the JSON such that it organizes the information into categories.Only return the JSON Object as the output directly without adding any other metadata Remove any empty arrays or unnecessary data. Here is the input JSON:
    ${JSON.stringify(inputData)}`;

    // Transform JSON using GROQ API
    const transformedData = await transformJsonUsingGroq(inputData, prompt);

    // Save the transformed JSON to the output file
    saveToJsonFile(transformedData, outputFilePath);
  } catch (error) {
    console.error("Error processing and saving transformed JSON:", error);
  }
}

module.exports = {
    processAndSaveTransformedJsonGroq,
};