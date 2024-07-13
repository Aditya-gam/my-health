import fs from "fs";

function readFileBytes(filePath: string): Buffer {
  try {
    return fs.readFileSync(filePath);
  } catch (error) {
    console.error(`Error reading file from path ${filePath}:`, error);
    throw error;
  }
}

function saveToJsonFile(data: any, jsonFilePath: string): void {
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), "utf8");
    console.log(
      `Structured data converted to JSON and saved to ${jsonFilePath}`
    );
  } catch (error) {
    console.error("Error saving JSON:", error);
    throw error;
  }
}

function readJsonFile(jsonFilePath: string): any {
  try {
    const data = fs.readFileSync(jsonFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading JSON file from path ${jsonFilePath}:`, error);
    throw error;
  }
}

function removeSpecialCharacters(text: string): string {
  let cleanedText = text.replace(/\n+/g, " ");
  const regex = /[^\w\s.,-:]+/g;
  cleanedText = cleanedText.replace(regex, "");
  return cleanedText;
}

export { readFileBytes, saveToJsonFile, readJsonFile, removeSpecialCharacters };
