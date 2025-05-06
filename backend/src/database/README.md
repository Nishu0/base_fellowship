# Database Module

This module provides database access using Prisma ORM with PostgreSQL.

## Structure

- `prisma/` - Contains Prisma schema and client
- `repositories/` - Contains repository classes for database operations
- `scripts/` - Contains database setup and management scripts
- `index.ts` - Exports the database service and repositories

## Setup

### Prerequisites

1. Make sure PostgreSQL is running. You can use the provided docker-compose.yml:

```bash
docker compose up -d
```

This will start a PostgreSQL instance with the following configuration:
- Host: localhost
- Port: 5432
- Database: api
- Username: test
- Password: test

2. Make sure your `.env` file contains the correct DATABASE_URL:

```
DATABASE_URL="postgresql://test:test@localhost:5432/api?schema=public"
```

### Database Setup

Run the database setup script to initialize everything:

```bash
npm run db:setup
```

This will:
- Generate the Prisma client
- Create migrations if needed
- Apply migrations to the database

### Database Migration Commands

Here are all the available database commands:

```bash
# Set up the database (generate client, create and apply migrations)
npm run db:setup

# Generate Prisma client
npm run db:generate

# Create migrations for schema changes
npm run db:migrate

# Apply migrations to the database
npm run db:deploy

# Reset the database (drop all tables and recreate)
npx prisma migrate reset --force --schema=src/database/prisma/schema.prisma

# Open Prisma Studio to view and edit data
npm run db:studio
```

### Migration Workflow

When you make changes to the schema:

1. Update the schema in `src/database/prisma/schema.prisma`
2. Create a migration:
   ```bash
   npm run db:migrate -- --name your_migration_name
   ```
3. Apply the migration:
   ```bash
   npm run db:deploy
   ```

## Usage

### Using the DatabaseService

```typescript
import { DatabaseService } from './database';

// Get the database service instance
const db = DatabaseService.getInstance();

// Connect to the database
await db.connect();

// Use repositories
const session = await db.sessions.createSession();
const message = await db.messages.createMessage({
  content: 'Hello, world!',
  role: 'user',
  sessionId: session.id,
});

// Disconnect when done
await db.disconnect();
```

### Using Individual Repositories

```typescript
import { SessionRepository, MessageRepository, CharacterFileRepository } from './database';

// Create repository instances
const sessionRepo = new SessionRepository();
const messageRepo = new MessageRepository();
const characterFileRepo = new CharacterFileRepository();

// Use repositories
const session = await sessionRepo.createSession();
const message = await messageRepo.createMessage({
  content: 'Hello, world!',
  role: 'user',
  sessionId: session.id,
});
```

## Models

### Session

Represents a conversation session.

```prisma
model Session {
  id           String         @id @default(uuid())
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  messages     Message[]
  characterFile CharacterFile?
}
```

### Message

Represents a message in a conversation.

```prisma
model Message {
  id        String   @id @default(uuid())
  content   String
  role      String   // "user" or "assistant"
  createdAt DateTime @default(now())
  sessionId String
  session   Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
}
```

### CharacterFile

Represents a character file generated for a session.

```prisma
model CharacterFile {
  id        String   @id @default(uuid())
  content   Json     // Stores the character configuration as JSON
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  sessionId String   @unique
  session   Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}
```