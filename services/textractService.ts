import AWS from '../config/awsConfig';

const textract = new AWS.Textract();

async function analyzeDocument(imageBytes: Buffer): Promise<any> {
  try {
    const params = {
      Document: {
        Bytes: imageBytes,
      },
      FeatureTypes: ["TABLES", "FORMS"],
    };

    const response = await textract.analyzeDocument(params).promise();
    const blocks = response.Blocks;

    let lines: string[] = [];
    let keyValues: any[] = [];
    let tables: any[] = [];

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
        let table: any = { Rows: [] };
        const rows = blocks.filter(
          (b) => b.BlockType === "CELL" && b.ParentId === block.Id
        );
        rows.forEach((cell) => {
          if (!table.Rows[cell.RowIndex - 1]) table.Rows[cell.RowIndex - 1] = [];
          table.Rows[cell.RowIndex - 1][cell.ColumnIndex - 1] = cell.Text || "";
        });
        tables.push(table);
      }
    });

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

export { analyzeDocument };
