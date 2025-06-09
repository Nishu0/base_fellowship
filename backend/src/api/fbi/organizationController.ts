import { Request, Response } from 'express';
import { PrismaClient, FormInputType, DataStatus, OrganizationStatus, Organization, OrganizationUser } from '@prisma/client';
import { Logger } from '@/common/utils/logger';
import { sendEmail, sendOrganizationApprovalRequest } from '@/common/utils/emailService';

const prisma = new PrismaClient();

export class OrganizationController {
    async createOrganizationUser(req: Request, res: Response): Promise<void> {
        try {
            const { privyUserId, email, name } = req.body;

            if (!privyUserId) {
                res.status(400).json({
                    success: false,
                    error: "Privy user ID is required"
                });
                return;
            }

            const existingUser = await prisma.organizationUser.findUnique({
                where: { privyUserId }
            });

            if (existingUser) {
                res.status(400).json({
                    success: false,
                    error: "Organization user already exists"
                });
                return;
            }

            const user = await prisma.organizationUser.create({
                data: {
                    privyUserId,
                    email,
                    name
                }
            });

            res.status(201).json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Error in createOrganizationUser:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async createOrganization(req: Request, res: Response): Promise<void> {
        try {
            const { name, description, logoUrl, website, contactEmail } = req.body;
            const privyUserId = req.headers['privy-user-id'] as string;

            if (!privyUserId) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized - Privy user ID required"
                });
                return;
            }

            const orgUser = await prisma.organizationUser.findUnique({
                where: { privyUserId }
            });
            console.log('orgUser', orgUser);

            if (!orgUser) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized - Organization user not found"
                });
                return;
            }

            const organization = await prisma.organization.create({
                data: {
                    name,
                    description,
                    logoUrl,
                    website,
                    contactEmail,
                    ownerId: orgUser.id,
                    status: OrganizationStatus.PENDING
                }
            });

            // Try to send notification email to super admin, but don't fail if it doesn't work
            try {
                await sendOrganizationApprovalRequest(name);
            } catch (emailError) {
                console.error('Failed to send organization approval request email:', emailError);
                // Continue with the response even if email fails
            }

            res.status(201).json({
                success: true,
                data: {
                    ...organization,
                    message: "Organization created and pending approval"
                }
            });
        } catch (error) {
            Logger.error('OrganizationController', 'Error in createOrganization', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async createForm(req: Request, res: Response): Promise<void> {
        try {
            const { title, description, organizationId, fields } = req.body;
            const privyUserId = req.headers['privy-user-id'] as string;

            if (!privyUserId) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized - Privy user ID required"
                });
                return;
            }

            // Check if organization is approved
            const organization = await prisma.organization.findUnique({
                where: { id: organizationId }
            });

            if (!organization || organization.status !== OrganizationStatus.APPROVED) {
                res.status(403).json({
                    success: false,
                    error: "Organization is not approved"
                });
                return;
            }

            const orgUser = await prisma.organizationUser.findUnique({
                where: { privyUserId },
                include: {
                    organizationMemberships: {
                        where: {
                            organizationId,
                            role: 'ADMIN'
                        }
                    }
                }
            });

            if (!orgUser || orgUser.organizationMemberships.length === 0) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized - Not an admin of this organization"
                });
                return;
            }

            const form = await prisma.form.create({
                data: {
                    title,
                    description,
                    organizationId,
                    creatorId: orgUser.id,
                    fields: {
                        create: fields.map((field: any, index: number) => ({
                            label: field.label,
                            question: field.question,
                            inputType: field.inputType,
                            isRequired: field.isRequired,
                            options: field.options,
                            order: index
                        }))
                    }
                },
                include: {
                    fields: true
                }
            });

            res.status(201).json({
                success: true,
                data: form
            });
        } catch (error) {
            Logger.error('OrganizationController', 'Error in createForm', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async submitFormResponse(req: Request, res: Response): Promise<void> {
        try {
            const { formId, responses, walletAddress, githubUsername } = req.body;

            // Create or find user
            let user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { githubId: githubUsername },
                        { wallets: { some: { address: walletAddress } } }
                    ]
                }
            });

            if (!user) {
                user = await prisma.user.create({
                    data: {
                        githubId: githubUsername,
                        wallets: walletAddress ? {
                            create: {
                                id: `${githubUsername || 'anon'}-${walletAddress}`,
                                address: walletAddress,
                                chainType: 'ethereum',
                                chainId: '1'
                            }
                        } : undefined
                    }
                });
            }

            // Create form response
            const formResponse = await prisma.formResponse.create({
                data: {
                    formId,
                    userId: user.id,
                    walletAddress,
                    githubUsername,
                    fieldResponses: {
                        create: responses.map((response: any) => ({
                            fieldId: response.fieldId,
                            value: response.value
                        }))
                    }
                },
                include: {
                    fieldResponses: true
                }
            });

            // If form has GitHub or wallet fields, trigger analysis
            const form = await prisma.form.findUnique({
                where: { id: formId },
                include: { fields: true }
            });

            if (form) {
                const hasGithubField = form.fields.some(f => f.inputType === FormInputType.GITHUB_AUTH);
                const hasWalletField = form.fields.some(f => f.inputType === FormInputType.WALLET_AUTH);

                if (hasGithubField && githubUsername) {
                    // Trigger GitHub analysis
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            dataStatus: DataStatus.PENDING,
                            githubData: {
                                update: {
                                    status: DataStatus.PENDING
                                }
                            }
                        }
                    });
                }

                if (hasWalletField && walletAddress) {
                    // Trigger wallet analysis
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            dataStatus: DataStatus.PENDING,
                            onchainData: {
                                update: {
                                    status: DataStatus.PENDING
                                }
                            }
                        }
                    });
                }
            }

            res.status(201).json({
                success: true,
                data: formResponse
            });
        } catch (error) {
            Logger.error('OrganizationController', 'Error in submitFormResponse', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async createUserList(req: Request, res: Response): Promise<void> {
        try {
            const { name, description, organizationId, formId, selectedUserIds } = req.body;
            const privyUserId = req.headers['privy-user-id'] as string;

            if (!privyUserId) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized - Privy user ID required"
                });
                return;
            }

            const orgUser = await prisma.organizationUser.findUnique({
                where: { privyUserId },
                include: {
                    organizationMemberships: {
                        where: {
                            organizationId,
                            role: 'ADMIN'
                        }
                    }
                }
            });

            if (!orgUser || orgUser.organizationMemberships.length === 0) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized - Not an admin of this organization"
                });
                return;
            }

            const list = await prisma.userList.create({
                data: {
                    name,
                    description,
                    organizationId,
                    formId,
                    creatorId: orgUser.id,
                    selectedUsers: {
                        create: selectedUserIds.map((userId: string) => ({
                            userId,
                            formResponseId: userId // Assuming formResponseId is the same as userId for now
                        }))
                    }
                },
                include: {
                    selectedUsers: true
                }
            });

            res.status(201).json({
                success: true,
                data: list
            });
        } catch (error) {
            Logger.error('OrganizationController', 'Error in createUserList', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async getFormResponses(req: Request, res: Response): Promise<void> {
        try {
            const { formId } = req.params;
            const privyUserId = req.headers['privy-user-id'] as string;

            if (!privyUserId) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized - Privy user ID required"
                });
                return;
            }

            const form = await prisma.form.findUnique({
                where: { id: formId },
                include: {
                    organization: {
                        include: {
                            members: {
                                where: {
                                    organizationUser: {
                                        privyUserId
                                    },
                                    role: 'ADMIN'
                                }
                            }
                        }
                    }
                }
            });

            if (!form || form.organization.members.length === 0) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized - Not an admin of this organization"
                });
                return;
            }

            const responses = await prisma.formResponse.findMany({
                where: { formId },
                include: {
                    fieldResponses: true,
                    user: {
                        include: {
                            githubData: true,
                            onchainData: true
                        }
                    }
                }
            });

            res.status(200).json({
                success: true,
                data: responses
            });
        } catch (error) {
            Logger.error('OrganizationController', 'Error in getFormResponses', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async getOrganizations(req: Request, res: Response): Promise<void> {
        try {
            const privyUserId = req.headers['privy-user-id'] as string;

            if (!privyUserId) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized - Privy user ID required"
                });
                return;
            }

            const orgUser = await prisma.organizationUser.findUnique({
                where: { privyUserId },
                include: {
                    ownedOrganizations: {
                        where: {
                            status: OrganizationStatus.APPROVED
                        }
                    },
                    organizationMemberships: {
                        where: {
                            organization: {
                                status: OrganizationStatus.APPROVED
                            }
                        },
                        include: {
                            organization: true
                        }
                    }
                }
            });

            if (!orgUser) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized - Organization user not found"
                });
                return;
            }

            // Combine owned organizations and memberships
            const organizations = [
                ...(orgUser.ownedOrganizations || []),
                ...(orgUser.organizationMemberships?.map(m => m.organization) || [])
            ];

            res.status(200).json({
                success: true,
                data: organizations
            });
        } catch (error) {
            Logger.error('OrganizationController', 'Error in getOrganizations', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async getOrganizationForms(req: Request, res: Response): Promise<void> {
        try {
            const { orgId } = req.params;
            const privyUserId = req.headers['privy-user-id'] as string;

            if (!privyUserId) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized - Privy user ID required"
                });
                return;
            }

            const orgUser = await prisma.organizationUser.findUnique({
                where: { privyUserId },
                include: {
                    organizationMemberships: {
                        where: {
                            organizationId: orgId
                        }
                    }
                }
            });

            if (!orgUser || orgUser.organizationMemberships.length === 0) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized - Not a member of this organization"
                });
                return;
            }

            const forms = await prisma.form.findMany({
                where: { organizationId: orgId },
                include: {
                    fields: true,
                    _count: {
                        select: {
                            responses: true
                        }
                    }
                }
            });

            res.status(200).json({
                success: true,
                data: forms
            });
        } catch (error) {
            Logger.error('OrganizationController', 'Error in getOrganizationForms', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async getOrganizationLists(req: Request, res: Response): Promise<void> {
        try {
            const { orgId } = req.params;
            const privyUserId = req.headers['privy-user-id'] as string;

            if (!privyUserId) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized - Privy user ID required"
                });
                return;
            }

            const orgUser = await prisma.organizationUser.findUnique({
                where: { privyUserId },
                include: {
                    organizationMemberships: {
                        where: {
                            organizationId: orgId
                        }
                    }
                }
            });

            if (!orgUser || orgUser.organizationMemberships.length === 0) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized - Not a member of this organization"
                });
                return;
            }

            const lists = await prisma.userList.findMany({
                where: { organizationId: orgId },
                include: {
                    _count: {
                        select: {
                            selectedUsers: true
                        }
                    }
                }
            });

            res.status(200).json({
                success: true,
                data: lists
            });
        } catch (error) {
            Logger.error('OrganizationController', 'Error in getOrganizationLists', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async checkAdminStatus(req: Request, res: Response): Promise<void> {
        try {
            const { orgId } = req.params;
            const privyUserId = req.headers['privy-user-id'] as string;

            if (!privyUserId) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized - Privy user ID required"
                });
                return;
            }

            const orgUser = await prisma.organizationUser.findUnique({
                where: { privyUserId },
                include: {
                    organizationMemberships: {
                        where: {
                            organizationId: orgId,
                            role: 'ADMIN'
                        }
                    },
                    ownedOrganizations: {
                        where: {
                            id: orgId
                        }
                    }
                }
            });

            if (!orgUser) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized - Organization user not found"
                });
                return;
            }

            const isAdmin = orgUser.organizationMemberships.length > 0 || orgUser.ownedOrganizations.length > 0;

            res.status(200).json({
                success: true,
                data: {
                    isAdmin
                }
            });
        } catch (error) {
            Logger.error('OrganizationController', 'Error in checkAdminStatus', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }
} 