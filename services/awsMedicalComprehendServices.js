const AWS = require("../config/awsConfig");

const comprehendMedical = new AWS.ComprehendMedical();

// Function to detect entities and redact text
async function redactMedicalInfo(text) {
    const params = {
        Text: text
    };

    try {
        // Call the Comprehend Medical API to detect entities
        const data = await comprehendMedical.detectEntitiesV2(params).promise();
        const entities = data.Entities;

        // Replace each detected entity with a placeholder
        let redactedText = text;
        entities.forEach(entity => {
            const entityText = text.substring(entity.BeginOffset, entity.EndOffset);
            redactedText = redactedText.replace(entityText, '*****');
        });

        return redactedText;
    } catch (error) {
        console.error('Error detecting entities:', error);
        throw error;
    }
}

module.exports = {
    redactMedicalInfo
};