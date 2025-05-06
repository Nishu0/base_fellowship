import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Script to set up the database
 * 
 * This script:
 * 1. Generates the Prisma client
 * 2. Creates migrations if needed
 * 3. Applies migrations to the database
 */

// Get the root directory of the project
const rootDir = path.resolve(__dirname, '../../../');

// Path to the Prisma schema
const schemaPath = path.resolve(rootDir, 'src/database/prisma/schema.prisma');

// Check if the schema file exists
if (!fs.existsSync(schemaPath)) {
  console.error(`Prisma schema not found at ${schemaPath}`);
  process.exit(1);
}

try {
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync(`npx prisma generate --schema=${schemaPath}`, { stdio: 'inherit' });
  
  // Create migrations if needed
  console.log('\nCreating migrations if needed...');
  try {
    execSync(`npx prisma migrate dev --name init --schema=${schemaPath}`, { stdio: 'inherit' });
  } catch (error) {
    console.warn('Migration creation failed. This might be expected if migrations already exist.');
  }
  
  // Apply migrations
  console.log('\nApplying migrations...');
  execSync(`npx prisma migrate deploy --schema=${schemaPath}`, { stdio: 'inherit' });
  
  console.log('\nDatabase setup completed successfully!');
} catch (error) {
  console.error('Error setting up the database:', error);
  process.exit(1);
} 