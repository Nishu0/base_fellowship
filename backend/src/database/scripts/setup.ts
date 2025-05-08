import { execSync } from 'child_process';
import path from 'path';

async function setup() {
    try {
        // Run Prisma migrations
        console.log('Running database migrations...');
        execSync('npx prisma migrate deploy --schema=src/database/prisma/schema.prisma', { stdio: 'inherit' });

        // Run platform config initialization
        console.log('Initializing platform configuration...');
        execSync('ts-node src/database/scripts/initPlatformConfig.ts', { stdio: 'inherit' });

        console.log('Setup completed successfully!');
    } catch (error) {
        console.error('Error during setup:', error);
        process.exit(1);
    }
}

setup(); 