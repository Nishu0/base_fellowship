import { Router } from 'express';
import { FbiController } from './fbiController';

const router = Router();
const fbiController = new FbiController();

router.post('/analyze-user', fbiController.analyzeUser.bind(fbiController));
router.get('/status/:githubUsername', fbiController.checkProcessingStatus.bind(fbiController));
router.get('/ethglobal-credentials/:address', fbiController.getETHGlobalCredentials.bind(fbiController));
router.get('/users/leaderboard', fbiController.getAllUsersByScore.bind(fbiController));
router.post('/organizations', fbiController.createOrganization.bind(fbiController));
router.get('/organizations', fbiController.getAllOrganizations.bind(fbiController));
router.get('/organizations/:name', fbiController.getOrganizationByName.bind(fbiController));
router.post('/reprocess-user/:githubUsername', fbiController.reprocessUser.bind(fbiController));
router.post('/reprocess-all-users', fbiController.reprocessAllUsers.bind(fbiController));

export default router; 