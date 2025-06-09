import { Router } from 'express';
import { OrganizationController } from './organizationController';
import { requireOrganizationUser } from './middleware/auth';

const router = Router();
const organizationController = new OrganizationController();

// Create organization user (no auth required)
router.post('/users', organizationController.createOrganizationUser.bind(organizationController));

// All other routes require organization user authentication
router.use(requireOrganizationUser);

// Create organization
router.post('/', organizationController.createOrganization.bind(organizationController));

// Create form
router.post('/forms', organizationController.createForm.bind(organizationController));

// Submit form response
router.post('/forms/:formId/responses', organizationController.submitFormResponse.bind(organizationController));

// Get form responses
router.get('/forms/:formId/responses', organizationController.getFormResponses.bind(organizationController));

// Create user list
router.post('/user-lists', organizationController.createUserList.bind(organizationController));

// Organization routes
router.get('/organizations', organizationController.getOrganizations.bind(organizationController));
router.get('/organizations/:orgId/forms', organizationController.getOrganizationForms.bind(organizationController));
router.get('/organizations/:orgId/lists', organizationController.getOrganizationLists.bind(organizationController));
router.get('/organizations/:orgId/is-admin', organizationController.checkAdminStatus.bind(organizationController));

export default router; 