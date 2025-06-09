import { Request, Response } from 'express';

import { PrismaClient, DataStatus } from '@prisma/client';
import { Logger } from '@/common/utils/logger';

import { env } from '@/common/utils/envConfig';
import { OrganiserService } from './organiserService';

const prisma = new PrismaClient();

export class OrganiserController {
    private organiserService: OrganiserService;

    constructor() {
        this.organiserService = new OrganiserService();
    }

    createOrganization = async (req: Request, res: Response) => {
        try {
            const { name, description, logoUrl, website, contactEmail } = req.body;
            const { privyId } = req.user!;

            const organization = await this.organiserService.createOrganization({
                name,
                description,
                logoUrl,
                website,
                contactEmail,
                privyId
            });

            res.status(201).json(organization);
        } catch (error) {
            console.error('Error creating organization:', error);
            res.status(500).json({ error: 'Failed to create organization' });
        }
    };

    getAllOrganizations = async (req: Request, res: Response) => {
        try {
            const organizations = await this.organiserService.getAllOrganizations();
            res.json(organizations);
        } catch (error) {
            console.error('Error fetching organizations:', error);
            res.status(500).json({ error: 'Failed to fetch organizations' });
        }
    };

    getOrganizationByName = async (req: Request, res: Response) => {
        try {
            const { name } = req.params;
            const organization = await this.organiserService.getOrganizationByName(name);
            
            if (!organization) {
                return res.status(404).json({ error: 'Organization not found' });
            }

            res.json(organization);
        } catch (error) {
            console.error('Error fetching organization:', error);
            res.status(500).json({ error: 'Failed to fetch organization' });
        }
    };

    createForm = async (req: Request, res: Response) => {
        try {
            const { name, description, formInputs, deadline, organizationId } = req.body;

            const form = await this.organiserService.createForm({
                name,
                description,
                formInputs,
                deadline: deadline ? new Date(deadline) : undefined,
                organizationId
            });

            res.status(201).json(form);
        } catch (error) {
            console.error('Error creating form:', error);
            res.status(500).json({ error: 'Failed to create form' });
        }
    };

    getPublicForm = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const form = await this.organiserService.getFormById(id);
            
            if (!form) {
                return res.status(404).json({ error: 'Form not found' });
            }

            res.json(form);
        } catch (error) {
            console.error('Error fetching form:', error);
            res.status(500).json({ error: 'Failed to fetch form' });
        }
    };

    getOrganizationForms = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const forms = await this.organiserService.getOrganizationForms(id);
            res.json(forms);
        } catch (error) {
            console.error('Error fetching organization forms:', error);
            res.status(500).json({ error: 'Failed to fetch organization forms' });
        }
    };

    getFormData = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const formData = await this.organiserService.getFormData(id);
            
            if (!formData) {
                return res.status(404).json({ error: 'Form data not found' });
            }

            res.json(formData);
        } catch (error) {
            console.error('Error fetching form data:', error);
            res.status(500).json({ error: 'Failed to fetch form data' });
        }
    };

    getFormSubmissions = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;
            
            const submissions = await this.organiserService.getFormSubmissions(
                id,
                Number(page),
                Number(limit)
            );

            res.json(submissions);
        } catch (error) {
            console.error('Error fetching form submissions:', error);
            res.status(500).json({ error: 'Failed to fetch form submissions' });
        }
    };
} 