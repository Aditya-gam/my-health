// services/groqService.js
const axios = require("axios");
const { groqApiKey, groqApiUrl } = require("../config/groqConfig");

async function transformJsonUsingGroq(inputJson, prompt, tokenLimit=2048) {
  try {
    const data = JSON.stringify({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "mixtral-8x7b-32768",
      max_tokens: tokenLimit,
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: groqApiUrl,
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error("Error calling GROQ API:", error);
    throw error;
  }
}

async function processAndSaveTransformedJsonGroq(inputJson) {
  try {
    // Create the prompt for GROQ API
    const prompt = `Structure and beautify the JSON such that it organizes the information into categories.Only return the JSON Object as the output directly without adding any other metadata Remove any empty arrays or unnecessary data or stopsequences such as slashes or \n or \t. Here is the input JSON:
    ${JSON.stringify(inputJson)}`;

    // Transform JSON using GROQ API
    const transformedData = await transformJsonUsingGroq(inputJson, prompt);
    return transformedData;
  } catch (error) {
    console.error("Error processing transformed JSON:", error);
    throw error;
  }
}

async function generateInference(transformedJson) {
  try {
    // Create the prompt for GROQ API
    const prompt = `Please provide a clear, empathetic, and straightforward explanation of the patient's medical chart. Focus on translating the medical terms and summaries into simple language that the patient can easily understand. Ensure the explanation is concise and free of unnecessary commentary, but retains a compassionate tone to help the patient feel comfortable and informed about their medical situation. ${JSON.stringify(
      transformedJson
    )}`;

    // Request a simplified explanation from the GROQ API
    const explanationData = await transformJsonUsingGroq(transformedJson, prompt, 1536);
    return explanationData;
  } catch (error) {
    console.error("Error generating layman explanation:", error);
    throw error;
  }
}

module.exports = {
  processAndSaveTransformedJsonGroq,
  generateInference,
};
