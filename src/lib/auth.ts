import { dash } from '@better-auth/infra';
import { betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: ['.env.local', '.env'], override: true });
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is required');
}

export const auth = betterAuth({
	database: new Pool({
		connectionString: databaseUrl,
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [tanstackStartCookies(), dash()],
});
