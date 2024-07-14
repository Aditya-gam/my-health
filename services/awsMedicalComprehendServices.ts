import AWS from "../config/awsConfig";

const comprehendMedical = new AWS.ComprehendMedical();

interface Entity {
  BeginOffset?: number;
  EndOffset?: number;
}

interface DetectEntitiesV2Response {
  Entities: Entity[];
}

async function redactMedicalInfo(text: string): Promise<string> {
  const params = {
    Text: text,
  };

  try {
    const data: DetectEntitiesV2Response = await comprehendMedical.detectEntitiesV2(params).promise();
    const entities = data.Entities;

    let redactedText = text;
    entities.forEach((entity) => {
      if (entity.BeginOffset !== undefined && entity.EndOffset !== undefined) {
        const entityText = text.substring(entity.BeginOffset, entity.EndOffset);
        redactedText = redactedText.replace(entityText, "*****");
      }
    });

    return redactedText;
  } catch (error) {
    console.error("Error detecting entities:", error);
    throw error;
  }
}

export { redactMedicalInfo };
