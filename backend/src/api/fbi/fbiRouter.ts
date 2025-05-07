import { Router } from 'express';
import { FbiController } from './fbiController';

const router = Router();
const fbiController = new FbiController();

router.post('/analyze-user', fbiController.analyzeUser.bind(fbiController));
router.get('/status/:githubUsername', fbiController.checkProcessingStatus.bind(fbiController));

export default router; 