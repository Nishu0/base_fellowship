import { Request, Response } from 'express';
import { PrismaClient, OrganizationStatus } from '@prisma/client';
import { Logger } from '@/common/utils/logger';
import { sendOrganizationApproved, sendOrganizationRejected } from '@/common/utils/emailService';

const prisma = new PrismaClient();

export class AdminController {
    async getPendingOrganizations(req: Request, res: Response): Promise<void> {
        try {
            const organizations = await prisma.organization.findMany({
                where: {
                    status: OrganizationStatus.PENDING
                },
                include: {
                    owner: true
                }
            });

            res.status(200).json({
                success: true,
                data: organizations
            });
        } catch (error) {
            Logger.error('AdminController', 'Error in getPendingOrganizations', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async approveOrganization(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const organization = await prisma.organization.update({
                where: { id },
                data: {
                    status: OrganizationStatus.APPROVED
                },
                include: {
                    owner: true
                }
            });

            // Try to send approval email, but don't fail if it doesn't work
            try {
                if (organization.owner.email) {
                    await sendOrganizationApproved(organization.name, organization.owner.email);
                }
            } catch (emailError) {
                console.error('Failed to send organization approval email:', emailError);
            }

            res.status(200).json({
                success: true,
                data: organization
            });
        } catch (error) {
            Logger.error('AdminController', 'Error in approveOrganization', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async rejectOrganization(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            if (!reason) {
                res.status(400).json({
                    success: false,
                    error: "Rejection reason is required"
                });
                return;
            }

            const organization = await prisma.organization.update({
                where: { id },
                data: {
                    status: OrganizationStatus.REJECTED,
                    rejectionReason: reason
                },
                include: {
                    owner: true
                }
            });

            // Try to send rejection email, but don't fail if it doesn't work
            try {
                if (organization.owner.email) {
                    await sendOrganizationRejected(organization.name, organization.owner.email, reason);
                }
            } catch (emailError) {
                console.error('Failed to send organization rejection email:', emailError);
            }

            res.status(200).json({
                success: true,
                data: organization
            });
        } catch (error) {
            Logger.error('AdminController', 'Error in rejectOrganization', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }
} 