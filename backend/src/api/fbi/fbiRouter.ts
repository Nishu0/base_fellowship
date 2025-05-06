import { Router } from 'express';
import { FbiController } from './fbiController';

const router = Router();
const fbiController = new FbiController();

router.post('/analyze-user', (req, res) => fbiController.analyzeUser(req, res));

export default router; 