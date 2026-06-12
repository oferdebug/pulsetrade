import { and, count, eq } from 'drizzle-orm';
import { db } from '#/db';
import {
	alertDeliveries,
	alertEvents,
	alerts,
	userAlertPrefs,
} from '#/db/schema';

export async function listAlerts(
	userId: string,
): Promise<Array<typeof alerts.$inferSelect>> {
	return db.select().from(alerts).where(eq(alerts.userId, userId));
}

export async function listActiveAlertsByCadence(
	cadence: string,
): Promise<Array<typeof alerts.$inferSelect>> {
	return db
		.select()
		.from(alerts)
		.where(and(eq(alerts.cadence, cadence), eq(alerts.isActive, true)));
}

export async function updateAlertEvaluationState(
	alertId: string,
	patch: {
		lastState: string;
		lastEvaluationAt: Date;
		lastTriggeredAt?: Date;
	},
) {
	const [row] = await db
		.update(alerts)
		.set(patch)
		.where(eq(alerts.id, alertId))
		.returning();
	if (!row) throw new Error('Alert not found');
	return row;
}

export async function getUserAlertPrefs(userId: string) {
	const [row] = await db
		.select()
		.from(userAlertPrefs)
		.where(eq(userAlertPrefs.userId, userId))
		.limit(1);
	return row ?? null;
}

export async function countActiveAlertsByUser(userId: string): Promise<number> {
	const rows = await db
		.select({ count: count() })
		.from(alerts)
		.where(and(eq(alerts.userId, userId), eq(alerts.isActive, true)));
	return Number(rows[0]?.count ?? 0);
}

export async function getAlertById(userId: string, alertId: string) {
	const [row] = await db
		.select()
		.from(alerts)
		.where(and(eq(alerts.id, alertId), eq(alerts.userId, userId)))
		.limit(1);
	return row ?? null;
}

export async function createAlertRow(values: typeof alerts.$inferInsert) {
	const [row] = await db.insert(alerts).values(values).returning();
	if (!row) throw new Error('Failed to create alert row');
	return row;
}

export async function toggleAlert(
	userId: string,
	alertId: string,
	isActive: boolean,
) {
	const [row] = await db
		.update(alerts)
		.set({ isActive })
		.where(and(eq(alerts.id, alertId), eq(alerts.userId, userId)))
		.returning();
	if (!row) throw new Error('Alert not found');
	return row;
}

export async function updateAlert(
	userId: string,
	alertId: string,
	patch: {
		symbol?: string;
		triggerType?: string;
		triggerConfig?: string;
		cadence?: string;
		channels?: string;
	},
) {
	const [row] = await db
		.update(alerts)
		.set(patch)
		.where(and(eq(alerts.id, alertId), eq(alerts.userId, userId)))
		.returning();
	if (!row) throw new Error('Alert not found');
	return row;
}

export async function deleteAlert(userId: string, alertId: string) {
	const [row] = await db
		.delete(alerts)
		.where(and(eq(alerts.id, alertId), eq(alerts.userId, userId)))
		.returning();
	if (!row) throw new Error('Alert not found');
	return row;
}

export async function createAlertEventRow(
	values: typeof alertEvents.$inferInsert,
) {
	const [row] = await db.insert(alertEvents).values(values).returning();
	if (!row) throw new Error('Failed to create alert event row');
	return row;
}

export async function createAlertDeliveryRow(
	values: typeof alertDeliveries.$inferInsert,
) {
	const [row] = await db.insert(alertDeliveries).values(values).returning();
	if (!row) throw new Error('Failed to create alert delivery row');
	return row;
}
