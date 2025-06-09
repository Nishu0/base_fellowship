import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserType } from '@prisma/client';
import { Logger } from '@/common/utils/logger';

const prisma = new PrismaClient();

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const privyUserId = req.headers['privy-user-id'] as string;

        if (!privyUserId) {
            res.status(401).json({
                success: false,
                error: "Unauthorized - Privy user ID required"
            });
            return;
        }

        const user = await prisma.organizationUser.findUnique({
            where: { privyUserId }
        });

        if (!user || user.userType !== UserType.SUPER_ADMIN) {
            res.status(403).json({
                success: false,
                error: "Forbidden - Super admin access required"
            });
            return;
        }

        // Add user to request for use in controllers
        req.user = user;
        next();
    } catch (error) {
        Logger.error('AuthMiddleware', 'Error in requireSuperAdmin', { error });
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

export const requireOrganizationUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const privyUserId = req.headers['privy-user-id'] as string;

        if (!privyUserId) {
            res.status(401).json({
                success: false,
                error: "Unauthorized - Privy user ID required"
            });
            return;
        }

        const user = await prisma.organizationUser.findUnique({
            where: { privyUserId }
        });

        if (!user) {
            res.status(401).json({
                success: false,
                error: "Unauthorized - Organization user not found"
            });
            return;
        }

        // Add user to request for use in controllers
        req.user = user;
        next();
    } catch (error) {
        Logger.error('AuthMiddleware', 'Error in requireOrganizationUser', { error });
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}; 