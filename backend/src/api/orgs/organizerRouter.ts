import { Router } from 'express';
import { OrganiserController } from './organiserController';
import { verifyPrivyToken, verifyOrganizationAccess } from '../../common/middleware/privyAuth'
const router = Router();
const organiserController = new OrganiserController();

// Public routes
router.get('/:name', organiserController.getOrganizationByName.bind(organiserController));
router.get('/form/:id', organiserController.getPublicForm.bind(organiserController));

// Protected routes
router.post('/register', verifyPrivyToken, organiserController.createOrganization.bind(organiserController));
router.get('/', verifyPrivyToken, organiserController.getAllOrganizations.bind(organiserController));

// Organization-specific protected routes
router.post('/form/create', verifyPrivyToken, verifyOrganizationAccess, organiserController.createForm.bind(organiserController));
router.get('/:id/forms', verifyPrivyToken, verifyOrganizationAccess, organiserController.getOrganizationForms.bind(organiserController));
router.get('/form/:id/data', verifyPrivyToken, verifyOrganizationAccess, organiserController.getFormData.bind(organiserController));
router.get('/form/:id/submissions', verifyPrivyToken, verifyOrganizationAccess, organiserController.getFormSubmissions.bind(organiserController));

export default router; 