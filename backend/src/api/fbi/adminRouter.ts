import { Router } from 'express';
import { AdminController } from './adminController';
import { requireSuperAdmin } from './middleware/auth';

const router = Router();
const adminController = new AdminController();

// All admin routes require super admin access
router.use(requireSuperAdmin);

// Get pending organizations
router.get('/organizations/pending', adminController.getPendingOrganizations.bind(adminController));

// Approve organization
router.post('/organizations/:id/approve', adminController.approveOrganization.bind(adminController));

// Reject organization
router.post('/organizations/:id/reject', adminController.rejectOrganization.bind(adminController));

export default router; 