import { PrismaClient, UserType } from '@prisma/client';

const prisma = new PrismaClient();

async function createSuperAdmin() {
    try {
        const superAdminEmail = 'itsthakkarnisarg@gmail.com';
        const privyUserId = process.argv[2]; // Get privyUserId from command line argument

        if (!privyUserId) {
            throw new Error('Privy user ID is required as a command line argument');
        }

        // Check if super admin already exists
        const existingSuperAdmin = await prisma.organizationUser.findFirst({
            where: {
                userType: UserType.SUPER_ADMIN
            }
        });

        if (existingSuperAdmin) {
            console.log('Super admin already exists:', existingSuperAdmin.email);
            return;
        }

        // Create super admin user
        const superAdmin = await prisma.organizationUser.create({
            data: {
                privyUserId,
                email: superAdminEmail,
                name: 'Super Admin',
                userType: UserType.SUPER_ADMIN
            }
        });

        console.log('Super admin created successfully:', superAdmin.email);
    } catch (error) {
        console.error('Error creating super admin:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

createSuperAdmin(); 