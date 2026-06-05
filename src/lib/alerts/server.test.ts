import { describe, expect, it } from 'vitest';
import {
	alertDeliveries,
	alertEvents,
	alerts,
	userAlertPrefs,
} from '#/db/schema';
import { createAlert } from './server';

describe('alerts schema', () => {
	it('exports required alerts tables', () => {
		expect(alerts).toBeDefined();
		expect(alertEvents).toBeDefined();
		expect(alertDeliveries).toBeDefined();
		expect(userAlertPrefs).toBeDefined();
	});
});

describe('alerts server', () => {
	it('rejects free user sixth active alert', async () => {
		const result = await createAlert({
			data: {
				symbol: 'AAPL',
				triggerType: 'price',
				triggerConfig: { direction: 'above', value: 200 },
				cadence: '1m',
				channels: ['email'],
			},
		});
		expect(result.ok).toBe(false);
		expect((result as { errorCode: string }).errorCode).toBe(
			'free_cap_reached',
		);
	});
});

describe('createAlert', () => {
	it('creates alert for pro user', async () => {
		const result = await createAlert({
			data: {
				symbol: 'AAPL',
				triggerType: 'price',
				triggerConfig: { direction: 'above', value: 200 },
				cadence: '1m',
				channels: ['email', 'sms'],
				context: { plan: 'pro', activeAlerts: 99 },
			},
		});
		expect(result.ok).toBe(true);
		if (!result.ok) {
			throw new Error('Expected successful createAlert result');
		}

		expect(result.alert).toBeDefined();
		expect(result.alert.symbol).toBe('AAPL');
		expect(result.alert.triggerType).toBe('price');
		expect(result.alert.triggerConfig).toStrictEqual({
			direction: 'above',
			value: 200,
		});
		expect(result.alert.cadence).toBe('1m');
		expect(result.alert.channels).toStrictEqual(['email', 'sms']);
		expect(result.alert.context).toStrictEqual({
			plan: 'pro',
			activeAlerts: 99,
		});
	});
});
