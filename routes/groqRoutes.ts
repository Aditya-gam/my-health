import express, { Request, Response } from 'express';
import { processAndSaveTransformedJsonGroq } from '../services/groqServices';

const router = express.Router();

router.post('/transform', async (req: Request, res: Response) => {
  try {
    const { inputJson } = req.body;

    if (!inputJson) {
      return res.status(400).json({ error: 'Input JSON is required' });
    }

    const transformedJson = await processAndSaveTransformedJsonGroq(inputJson);

    res.status(200).json({ message: 'JSON transformed successfully', transformedJson });
  } catch (error) {
    console.error("Error during JSON transformation:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
