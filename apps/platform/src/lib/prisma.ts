import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// We use the connection pooler URL (DATABASE_URL) for standard app queries
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Pass the adapter into the PrismaClient constructor
export const prisma = new PrismaClient({ adapter });