import axios from "axios";
import { groqConfig } from "../config/groqConfig";

async function transformJsonUsingGroq(
  inputJson: any,
  prompt: string,
  tokenLimit = 2048
): Promise<any> {
  try {
    const data = JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      model: "mixtral-8x7b-32768",
      max_tokens: tokenLimit,
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: groqConfig.groqApiUrl,
      headers: {
        Authorization: `Bearer ${groqConfig.groqApiKey}`,
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

async function processAndSaveTransformedJsonGroq(inputJson: any): Promise<any> {
  try {
    const prompt = `Structure and beautify the JSON such that it organizes the information into categories. Only return the JSON Object as the output directly without adding any other metadata Remove any empty arrays or unnecessary data or stopsequences such as slashes or \\n or \\t. Here is the input JSON: ${JSON.stringify(
      inputJson
    )};`;

    const transformedData = await transformJsonUsingGroq(inputJson, prompt);
    return transformedData;
  } catch (error) {
    console.error("Error processing transformed JSON:", error);
    throw error;
  }
}

async function generateInference(transformedJson: any): Promise<any> {
  try {
    const prompt = `Please provide a clear, empathetic, and straightforward explanation of the patient's medical chart. Focus on translating the medical terms and summaries into simple language that the patient can easily understand. Ensure the explanation is concise and free of unnecessary commentary, but retains a compassionate tone to help the patient feel comfortable and informed about their medical situation. ${JSON.stringify(
      transformedJson
    )};`;

    const explanationData = await transformJsonUsingGroq(
      transformedJson,
      prompt,
      1536
    );
    return explanationData;
  } catch (error) {
    console.error("Error generating layman explanation:", error);
    throw error;
  }
}

export { processAndSaveTransformedJsonGroq, generateInference };
