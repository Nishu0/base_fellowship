import { Request, Response, NextFunction } from 'express';
import { PrivyClient } from '@privy-io/server-auth';
import { PrismaClient, DataStatus } from '@prisma/client';
import { env } from '../utils/envConfig';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: {
        privyId: string;
        [key: string]: any;
      };
    }
  }
}

const privyClient = new PrivyClient(env.PRIVY_APP_ID, env.PRIVY_APP_SECRET);

export const verifyPrivyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.access_token;
    
    if (!token) {
      return res.status(401).json({ error: 'No access token provided' });
    }

    const verifiedToken : any = await privyClient.verifyAuthToken(token);
    verifiedToken["privyId"] = verifiedToken.userId as any
    req.user = verifiedToken as any;
    next();
  } catch (error) {
    console.error('Privy token verification failed:', error);
    return res.status(401).json({ error: 'Invalid access token' });
  }
};

export const verifyOrganizationAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { privyId } = req.user!;
    const organizationId = req.params.id || req.body.organizationId;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    if (organization.privyId !== privyId) {
      return res.status(403).json({ error: 'Unauthorized access to organization' });
    }

    next();
  } catch (error) {
    console.error('Organization access verification failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 