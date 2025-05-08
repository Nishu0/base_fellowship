import { Router } from 'express';
import { FbiController } from './fbiController';

const router = Router();
const fbiController = new FbiController();

router.post('/analyze-user', fbiController.analyzeUser.bind(fbiController));
router.get('/status/:githubUsername', fbiController.checkProcessingStatus.bind(fbiController));
router.get('/ethglobal-credentials/:address', fbiController.getETHGlobalCredentials.bind(fbiController));
router.get('/users/leaderboard', fbiController.getAllUsersByScore.bind(fbiController));

export default router; 