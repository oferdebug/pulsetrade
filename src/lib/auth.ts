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

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
if (!githubClientId || !githubClientSecret) {
	throw new Error('GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are required');
}

const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';

const trustedOrigins = [
	'http://localhost:3000',
	'http://127.0.0.1:3000',
	...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
		? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(',').map((o) => o.trim())
		: []),
	...(baseURL !== 'http://localhost:3000' ? [baseURL] : []),
];

export const auth = betterAuth({
	baseURL,
	secret: process.env.BETTER_AUTH_SECRET,
	trustedOrigins,
	database: pool,
	account: {
		storeStateStrategy: 'database',
	},
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: googleClientId,
			clientSecret: googleClientSecret,
		},
		github: {
			clientId: githubClientId,
			clientSecret: githubClientSecret,
		},
	},
	plugins: [dash(), tanstackStartCookies()],
});
