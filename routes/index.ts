import express from 'express';
import textractRoutes from './textractRoutes';
import groqRoutes from './groqRoutes';

const router = express.Router();

router.use('/textract', textractRoutes);
router.use('/groq', groqRoutes);

export default router;
