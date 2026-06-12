import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { z } from 'zod';
import type { alerts } from '#/db/schema';
import { auth } from '#/lib/auth';
import {
	type AlertTriggerConfig,
	type AlertTriggerType,
	canCreateAlert,
	canUseChannel,
	type Plan,
} from './policy';
import {
	countActiveAlertsByUser,
	createAlertRow,
	deleteAlert as deleteAlertRow,
	getAlertById,
	listAlerts as listAlertsByUser,
	toggleAlert as toggleAlertRow,
	updateAlert as updateAlertRow,
} from './repository';

export type Channel = 'email' | 'push' | 'sms';

type AlertRow = typeof alerts.$inferSelect;

export type AlertView = {
	id: string;
	symbol: string;
	triggerType: AlertTriggerType;
	triggerConfig: AlertTriggerConfig;
	cadence: '1m' | '5m' | '15m';
	channels: Channel[];
	isActive: boolean;
	lastState: 'normal' | 'triggered';
	context: { plan: Plan; activeAlerts: number };
};

type AlertInput = {
	symbol: string;
	triggerType: AlertTriggerType;
	triggerConfig: AlertTriggerConfig;
	cadence: '1m' | '5m' | '15m';
	channels: Channel[];
};

type CreateAlertResult =
	| { ok: true; alert: AlertView }
	| { ok: false; errorCode: 'free_cap_reached' | 'unauthorized' };

type ToggleAlertResult =
	| { ok: true; alert: AlertView }
	| { ok: false; errorCode: 'free_cap_reached' };

const channelSchema = z.enum(['email', 'push', 'sms']);
const triggerTypeSchema = z.enum(['price', 'percentMove', 'volumeSpike']);
const cadenceSchema = z.enum(['1m', '5m', '15m']);
const planSchema = z.enum(['free', 'pro']);

const createAlertInputSchema = z.object({
	symbol: z.string().min(1).max(12),
	triggerType: triggerTypeSchema,
	triggerConfig: z.object({
		direction: z.enum(['above', 'below']),
		value: z.number(),
	}),
	cadence: cadenceSchema,
	channels: z.array(channelSchema).min(1),
	plan: planSchema.optional(),
});

const listAlertsInputSchema = z.object({
	plan: planSchema.optional(),
});

const toggleAlertInputSchema = z.object({
	alertId: z.string().min(1),
	isActive: z.boolean(),
	plan: planSchema.optional(),
});

const updateAlertInputSchema = z.object({
	alertId: z.string().min(1),
	plan: planSchema.optional(),
	patch: z.object({
		symbol: z.string().min(1).max(12).optional(),
		triggerType: triggerTypeSchema.optional(),
		triggerConfig: z
			.object({
				direction: z.enum(['above', 'below']),
				value: z.number(),
			})
			.optional(),
		cadence: cadenceSchema.optional(),
		channels: z.array(channelSchema).min(1).optional(),
	}),
});

const deleteAlertInputSchema = z.object({
	alertId: z.string().min(1),
});

const quickCreateInputSchema = z.object({
	symbol: z.string().min(1).max(12),
	plan: planSchema.optional(),
});

async function requireAuthUserId(): Promise<string> {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });
	if (!session?.user?.id) {
		throw new Error('Unauthorized');
	}
	return session.user.id;
}

async function buildAlertContext(
	userId: string,
	plan: Plan = 'free',
): Promise<{ plan: Plan; activeAlerts: number }> {
	return {
		plan,
		activeAlerts: await countActiveAlertsByUser(userId),
	};
}

function mapAlertRow(
	row: AlertRow,
	context: { plan: Plan; activeAlerts: number },
): AlertView {
	return {
		id: row.id,
		isActive: row.isActive,
		lastState: row.lastState as 'normal' | 'triggered',
		symbol: row.symbol,
		triggerType: row.triggerType as AlertView['triggerType'],
		triggerConfig: JSON.parse(row.triggerConfig) as AlertTriggerConfig,
		cadence: row.cadence as AlertView['cadence'],
		channels: JSON.parse(row.channels) as Channel[],
		context,
	};
}

function filterChannels(plan: Plan, channels: Channel[]): Channel[] {
	return channels.filter((ch) => canUseChannel({ plan }, ch));
}

export async function createAlert(args: {
	userId: string;
	plan?: Plan;
	input: AlertInput;
}): Promise<CreateAlertResult> {
	const plan = args.plan ?? 'free';
	const activeAlerts = await countActiveAlertsByUser(args.userId);

	const cap = canCreateAlert({ plan, activeAlerts });
	if (!cap.allowed) {
		return { ok: false, errorCode: 'free_cap_reached' };
	}

	const channels = filterChannels(plan, args.input.channels);

	const row = await createAlertRow({
		id: crypto.randomUUID(),
		userId: args.userId,
		symbol: args.input.symbol.toUpperCase(),
		triggerType: args.input.triggerType,
		triggerConfig: JSON.stringify(args.input.triggerConfig),
		cadence: args.input.cadence,
		channels: JSON.stringify(channels),
		isActive: true,
		lastState: 'normal',
	});

	const context = await buildAlertContext(args.userId, plan);
	return { ok: true, alert: mapAlertRow(row, context) };
}

export async function listAlerts(args: {
	userId: string;
	plan?: Plan;
}): Promise<AlertView[]> {
	const context = await buildAlertContext(args.userId, args.plan ?? 'free');
	const rows = await listAlertsByUser(args.userId);
	return rows.map((row) => mapAlertRow(row, context));
}

export async function toggleAlert(args: {
	userId: string;
	alertId: string;
	isActive: boolean;
	plan?: Plan;
}): Promise<ToggleAlertResult> {
	const plan = args.plan ?? 'free';

	if (args.isActive) {
		const activeAlerts = await countActiveAlertsByUser(args.userId);
		const cap = canCreateAlert({ plan, activeAlerts });
		if (!cap.allowed) {
			return { ok: false, errorCode: 'free_cap_reached' };
		}
	}

	const row = await toggleAlertRow(args.userId, args.alertId, args.isActive);
	const context = await buildAlertContext(args.userId, plan);
	return { ok: true, alert: mapAlertRow(row, context) };
}

export async function updateAlert(args: {
	userId: string;
	alertId: string;
	plan?: Plan;
	patch: Partial<AlertInput>;
}): Promise<AlertView> {
	const existing = await getAlertById(args.userId, args.alertId);
	if (!existing) {
		throw new Error('Alert not found');
	}

	const plan = args.plan ?? 'free';
	const channels = args.patch.channels
		? filterChannels(plan, args.patch.channels)
		: undefined;

	const row = await updateAlertRow(args.userId, args.alertId, {
		symbol: args.patch.symbol?.toUpperCase(),
		triggerType: args.patch.triggerType,
		triggerConfig: args.patch.triggerConfig
			? JSON.stringify(args.patch.triggerConfig)
			: undefined,
		cadence: args.patch.cadence,
		channels: channels ? JSON.stringify(channels) : undefined,
	});

	const context = await buildAlertContext(args.userId, plan);
	return mapAlertRow(row, context);
}

export async function deleteAlert(args: {
	userId: string;
	alertId: string;
}): Promise<{ ok: true }> {
	await deleteAlertRow(args.userId, args.alertId);
	return { ok: true };
}

export async function quickCreateAlertForSymbol(args: {
	userId: string;
	symbol: string;
	plan?: Plan;
}): Promise<CreateAlertResult> {
	return createAlert({
		userId: args.userId,
		plan: args.plan,
		input: {
			symbol: args.symbol,
			triggerType: 'price',
			triggerConfig: { direction: 'above', value: 0 },
			cadence: '1m',
			channels: ['email'],
		},
	});
}

export const createAlertFn = createServerFn({ method: 'POST' })
	.inputValidator((data: unknown) => createAlertInputSchema.parse(data))
	.handler(async ({ data }) => {
		const userId = await requireAuthUserId();
		return createAlert({
			userId,
			plan: data.plan,
			input: data,
		});
	});

export const listAlertsFn = createServerFn({ method: 'GET' })
	.inputValidator((data: unknown) => listAlertsInputSchema.parse(data ?? {}))
	.handler(async ({ data }) => {
		const userId = await requireAuthUserId();
		return listAlerts({ userId, plan: data.plan });
	});

export const toggleAlertFn = createServerFn({ method: 'POST' })
	.inputValidator((data: unknown) => toggleAlertInputSchema.parse(data))
	.handler(async ({ data }) => {
		const userId = await requireAuthUserId();
		return toggleAlert({
			userId,
			alertId: data.alertId,
			isActive: data.isActive,
			plan: data.plan,
		});
	});

export const updateAlertFn = createServerFn({ method: 'POST' })
	.inputValidator((data: unknown) => updateAlertInputSchema.parse(data))
	.handler(async ({ data }) => {
		const userId = await requireAuthUserId();
		return updateAlert({
			userId,
			alertId: data.alertId,
			plan: data.plan,
			patch: data.patch,
		});
	});

export const deleteAlertFn = createServerFn({ method: 'POST' })
	.inputValidator((data: unknown) => deleteAlertInputSchema.parse(data))
	.handler(async ({ data }) => {
		const userId = await requireAuthUserId();
		return deleteAlert({ userId, alertId: data.alertId });
	});

export const quickCreateAlertFn = createServerFn({ method: 'POST' })
	.inputValidator((data: unknown) => quickCreateInputSchema.parse(data))
	.handler(async ({ data }) => {
		const userId = await requireAuthUserId();
		return quickCreateAlertForSymbol({
			userId,
			symbol: data.symbol,
			plan: data.plan,
		});
	});
