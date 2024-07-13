import AWS from "../config/awsConfig";

const comprehendMedical = new AWS.ComprehendMedical();

async function redactMedicalInfo(text: string): Promise<string> {
  const params = {
    Text: text,
  };

  try {
    const data = await comprehendMedical.detectEntitiesV2(params).promise();
    const entities = data.Entities;

    let redactedText = text;
    entities.forEach((entity) => {
      const entityText = text.substring(entity.BeginOffset, entity.EndOffset);
      redactedText = redactedText.replace(entityText, "*****");
    });

    return redactedText;
  } catch (error) {
    console.error("Error detecting entities:", error);
    throw error;
  }
}

export { redactMedicalInfo };
