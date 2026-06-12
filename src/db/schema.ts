import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from 'drizzle-orm/pg-core';
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('emailVerified').default(false).notNull(),
	image: text('image'),
	createdAt: timestamp('createdAt').defaultNow().notNull(),
	updatedAt: timestamp('updatedAt')
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable(
	'session',
	{
		id: text('id').primaryKey(),
		expiresAt: timestamp('expiresAt').notNull(),
		token: text('token').notNull().unique(),
		createdAt: timestamp('createdAt').defaultNow().notNull(),
		updatedAt: timestamp('updatedAt')
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text('ipAddress'),
		userAgent: text('userAgent'),
		userId: text('userId')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
	},
	// biome-ignore lint: Drizzle schema requires any type
	(table: any) => [index('session_userId_idx').on(table.userId)],
);

export const account = pgTable(
	'account',
	{
		id: text('id').primaryKey(),
		accountId: text('accountId').notNull(),
		providerId: text('providerId').notNull(),
		userId: text('userId')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('accessToken'),
		refreshToken: text('refreshToken'),
		idToken: text('idToken'),
		accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
		refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestamp('createdAt').defaultNow().notNull(),
		updatedAt: timestamp('updatedAt')
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	// biome-ignore lint: Drizzle schema requires any type
	(table: any) => [index('account_userId_idx').on(table.userId)],
);

export const verification = pgTable(
	'verification',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestamp('expiresAt').notNull(),
		createdAt: timestamp('createdAt').defaultNow().notNull(),
		updatedAt: timestamp('updatedAt')
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	// biome-ignore lint: Drizzle schema requires any type
	(table: any) => [index('verification_identifier_idx').on(table.identifier)],
);

// biome-ignore lint: Drizzle schema requires any type
export const userRelations = relations(user, ({ many }: any) => ({
	sessions: many(session),
	accounts: many(account),
}));

// biome-ignore lint: Drizzle schema requires any type
export const sessionRelations = relations(session, ({ one }: any) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

// biome-ignore lint: Drizzle schema requires any type
export const accountRelations = relations(account, ({ one }: any) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const watchlist = pgTable(
	'watchlist',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		symbol: text('symbol').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	// biome-ignore lint: Drizzle schema requires any type
	(table: any) => [
		index('watchlist_userId_idx').on(table.userId),
		uniqueIndex('watchlist_user_symbol_unique').on(table.userId, table.symbol),
	],
);

// biome-ignore lint: Drizzle schema requires any type
export const watchlistRelations = relations(watchlist, ({ one }: any) => ({
	user: one(user, {
		fields: [watchlist.userId],
		references: [user.id],
	}),
}));

export const alerts = pgTable(
	'alerts',
	{
		id: text('id').primaryKey(),
		userId: text('userId')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		symbol: text('symbol').notNull(),
		triggerType: text('triggerType').notNull(),
		triggerConfig: text('triggerConfig').notNull(),
		cadence: text('cadence').notNull(),
		channels: text('channels').notNull(),
		isActive: boolean('isActive').default(true).notNull(),
		lastState: text('lastState').default('normal').notNull(),
		lastEvaluationAt: timestamp('lastEvaluationAt'),
		lastTriggeredAt: timestamp('lastTriggeredAt'),
		createdAt: timestamp('createdAt').defaultNow().notNull(),
		updatedAt: timestamp('updatedAt')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	// biome-ignore lint: Drizzle schema requires any type
	(table: any) => [
		index('alerts_userId_idx').on(table.userId),
		index('alerts_userId_cadence_idx').on(table.userId, table.cadence),
	],
);

export const alertEvents = pgTable(
	'alert_events',
	{
		id: text('id').primaryKey(),
		alertId: text('alertId')
			.notNull()
			.references(() => alerts.id, { onDelete: 'cascade' }),
		userId: text('userId')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		symbol: text('symbol').notNull(),
		triggerType: text('triggerType').notNull(),
		triggerSnapshot: text('triggerSnapshot').notNull(),
		status: text('status').notNull(),
		triggeredAt: timestamp('triggeredAt').defaultNow().notNull(),
	},
	// biome-ignore lint: Drizzle schema requires any type
	(table: any) => [
		index('alert_events_alertId_idx').on(table.alertId),
		index('alert_events_userId_idx').on(table.userId),
	],
);

export const alertDeliveries = pgTable(
	'alert_deliveries',
	{
		id: text('id').primaryKey(),
		eventId: text('eventId')
			.notNull()
			.references(() => alertEvents.id, { onDelete: 'cascade' }),
		channel: text('channel').notNull(),
		outcome: text('outcome').notNull(),
		reason: text('reason'),
		attemptedAt: timestamp('attemptedAt').defaultNow().notNull(),
	},
	// biome-ignore lint: Drizzle schema requires any type
	(table: any) => [index('alert_deliveries_eventId_idx').on(table.eventId)],
);

export const userAlertPrefs = pgTable('user_alert_prefs', {
	userId: text('userId')
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),
	quietHoursEnabled: boolean('quietHoursEnabled').default(false).notNull(),
	quietStart: text('quietStart'),
	quietEnd: text('quietEnd'),
	timezone: text('timezone').default('UTC').notNull(),
	channelDefaults: text('channelDefaults'),
	updatedAt: timestamp('updatedAt')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});
