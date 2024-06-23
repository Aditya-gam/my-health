// services/textractService.js
const AWS = require("../config/awsConfig");
const textract = new AWS.Textract();

// Function to analyze the document and extract structured data
async function analyzeDocument(imageBytes) {
  try {
    // Prepare the request parameters
    const params = {
      Document: {
        Bytes: imageBytes,
      },
      FeatureTypes: ["TABLES", "FORMS"], // Request analysis of tables and forms
    };

    // Call Amazon Textract to analyze the document
    const response = await textract.analyzeDocument(params).promise();

    // Extract structured data from the response
    const blocks = response.Blocks;

    let lines = [];
    let keyValues = [];
    let tables = [];

    blocks.forEach((block) => {
      if (block.BlockType === "LINE") {
        lines.push(block.Text);
      } else if (
        block.BlockType === "KEY_VALUE_SET" &&
        block.EntityTypes.includes("KEY")
      ) {
        const key = block.Text;
        const valueBlock = blocks.find(
          (b) =>
            b.BlockType === "KEY_VALUE_SET" &&
            b.EntityTypes.includes("VALUE") &&
            b.Id === block.Relationships[0].Ids[0]
        );
        const value = valueBlock ? valueBlock.Text : "";
        keyValues.push({ key, value });
      } else if (block.BlockType === "TABLE") {
        let table = { Rows: [] };
        const rows = blocks.filter(
          (b) => b.BlockType === "CELL" && b.ParentId === block.Id
        );
        rows.forEach((cell) => {
          // Initialize the row if it doesn't exist
          if (!table.Rows[cell.RowIndex - 1]) table.Rows[cell.RowIndex - 1] = [];
          // Assign the cell text to the appropriate position
          table.Rows[cell.RowIndex - 1][cell.ColumnIndex - 1] = cell.Text || "";
        });
        tables.push(table);
      }
    });

    // Create a structured JSON object
    const structuredData = {
      text: lines.join("\n"),
      keyValues: keyValues,
      tables: tables,
    };

    return structuredData;
  } catch (error) {
    console.error("Error during OCR:", error);
    throw error;
  }
}

module.exports = {
  analyzeDocument,
};
