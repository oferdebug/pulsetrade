import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema.ts';

config({ path: ['.env.local', '.env'], override: true });
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error('DATABASE_URL is Required');
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error('DATABASE_URL is Required');
}

export const pool = new Pool({
	connectionString,
});
if (!databaseUrl.startsWith('postgresql://')) {
	throw new Error('DATABASE_URL must start with postgresql://');
}

export const db = drizzle(pool, { schema });
