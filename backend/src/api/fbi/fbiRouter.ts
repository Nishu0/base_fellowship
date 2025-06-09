import { Router } from 'express';
import { FbiController } from './fbiController';
import organizationRouter from './organizationRouter';
import adminRouter from './adminRouter';

const router = Router();
const fbiController = new FbiController();

// FBI analysis routes
router.post('/analyze-user', fbiController.analyzeUser.bind(fbiController));
router.get('/status/:githubUsername', fbiController.checkProcessingStatus.bind(fbiController));
router.get('/ethglobal-credentials/:address', fbiController.getETHGlobalCredentials.bind(fbiController));
router.get('/users/leaderboard', fbiController.getAllUsersByScore.bind(fbiController));
router.post('/reprocess-user/:githubUsername', fbiController.reprocessUser.bind(fbiController));
router.post('/reprocess-all-users', fbiController.reprocessAllUsers.bind(fbiController));

// Organization routes
router.use('/org', organizationRouter);

// Admin routes
router.use('/admin', adminRouter);

export default router; 