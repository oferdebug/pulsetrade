import { dash } from '@better-auth/infra';
import { betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { config } from 'dotenv';
import { pool } from '#/db';

config({ path: ['.env.local', '.env'], override: true });
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
	throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required');
}

export const auth = betterAuth({
	database: pool,
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: googleClientId,
			clientSecret: googleClientSecret,
		},
	},
	plugins: [dash(), tanstackStartCookies()],
});
