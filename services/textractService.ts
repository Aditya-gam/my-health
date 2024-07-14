import AWS from '../config/awsConfig';

const textract = new AWS.Textract();

interface Block {
  BlockType?: string;
  Text?: string;
  EntityTypes?: string[];
  Id?: string;
  Relationships?: {
    Ids: string[];
  }[];
  RowIndex?: number;
  ColumnIndex?: number;
  ParentId?: string;
}

interface StructuredData {
  text: string;
  keyValues: { key: string; value: string }[];
  tables: { Rows: string[][] }[];
}

async function analyzeDocument(imageBytes: Buffer): Promise<StructuredData> {
  try {
    const params = {
      Document: {
        Bytes: imageBytes,
      },
      FeatureTypes: ["TABLES", "FORMS"],
    };

    const response = await textract.analyzeDocument(params).promise();
    const blocks: Block[] = (response.Blocks || []) as Block[];

    let lines: string[] = [];
    let keyValues: { key: string; value: string }[] = [];
    let tables: { Rows: string[][] }[] = [];

    blocks.forEach((block) => {
      if (block.BlockType === "LINE" && block.Text) {
        lines.push(block.Text);
      } else if (
        block.BlockType === "KEY_VALUE_SET" &&
        block.EntityTypes?.includes("KEY") &&
        block.Text &&
        block.Relationships
      ) {
        const key = block.Text;
        const valueBlock = blocks.find(
          (b) =>
            b.BlockType === "KEY_VALUE_SET" &&
            b.EntityTypes?.includes("VALUE") &&
            b.Id &&
            block.Relationships &&
            block.Relationships[0]?.Ids[0] &&
            b.Id === block.Relationships[0].Ids[0]
        );
        const value = valueBlock?.Text || "";
        keyValues.push({ key, value });
      } else if (block.BlockType === "TABLE" && block.Id) {
        let table: { Rows: string[][] } = { Rows: [] };
        const rows = blocks.filter(
          (b) => b.BlockType === "CELL" && b.ParentId === block.Id
        );
        rows.forEach((cell) => {
          if (cell.RowIndex !== undefined && cell.ColumnIndex !== undefined) {
            if (!table.Rows[cell.RowIndex - 1]) table.Rows[cell.RowIndex - 1] = [];
            table.Rows[cell.RowIndex - 1][cell.ColumnIndex - 1] = cell.Text || "";
          }
        });
        tables.push(table);
      }
    });

    const structuredData: StructuredData = {
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