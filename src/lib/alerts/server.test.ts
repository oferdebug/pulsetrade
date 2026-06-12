import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	alertDeliveries,
	alertEvents,
	alerts,
	userAlertPrefs,
} from '#/db/schema';
import * as repository from './repository';
import {
	createAlert,
	listAlerts,
	quickCreateAlertForSymbol,
	toggleAlert,
} from './server';

vi.mock('./repository', () => ({
	countActiveAlertsByUser: vi.fn(),
	createAlertRow: vi.fn(),
	listAlerts: vi.fn(),
	getAlertById: vi.fn(),
	toggleAlert: vi.fn(),
	updateAlert: vi.fn(),
	deleteAlert: vi.fn(),
	createAlertEventRow: vi.fn(),
	createAlertDeliveryRow: vi.fn(),
}));

const baseRow = {
	id: 'alert-1',
	userId: 'user-1',
	symbol: 'AAPL',
	triggerType: 'price',
	triggerConfig: JSON.stringify({ direction: 'above', value: 200 }),
	cadence: '1m',
	channels: JSON.stringify(['email', 'sms']),
	isActive: true,
	lastState: 'normal',
	lastEvaluationAt: null,
	lastTriggeredAt: null,
	createdAt: new Date(),
	updatedAt: new Date(),
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe('alerts schema', () => {
	it('exports required alerts tables', () => {
		expect(alerts).toBeDefined();
		expect(alertEvents).toBeDefined();
		expect(alertDeliveries).toBeDefined();
		expect(userAlertPrefs).toBeDefined();
	});
});

describe('createAlert', () => {
	it('rejects free user at active alert cap', async () => {
		vi.mocked(repository.countActiveAlertsByUser).mockResolvedValue(5);

		const result = await createAlert({
			userId: 'user-1',
			plan: 'free',
			input: {
				symbol: 'AAPL',
				triggerType: 'price',
				triggerConfig: { direction: 'above', value: 200 },
				cadence: '1m',
				channels: ['email'],
			},
		});

		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected blocked');
		expect(result.errorCode).toBe('free_cap_reached');
		expect(repository.createAlertRow).not.toHaveBeenCalled();
	});

	it('creates alert for pro user with sms channel', async () => {
		vi.mocked(repository.countActiveAlertsByUser).mockResolvedValue(2);
		vi.mocked(repository.createAlertRow).mockResolvedValue(baseRow);

		const result = await createAlert({
			userId: 'user-1',
			plan: 'pro',
			input: {
				symbol: 'aapl',
				triggerType: 'price',
				triggerConfig: { direction: 'above', value: 200 },
				cadence: '1m',
				channels: ['email', 'sms'],
			},
		});

		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('Expected successful createAlert result');

		expect(repository.createAlertRow).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: 'user-1',
				symbol: 'AAPL',
				channels: JSON.stringify(['email', 'sms']),
			}),
		);
		expect(result.alert.symbol).toBe('AAPL');
		expect(result.alert.channels).toStrictEqual(['email', 'sms']);
		expect(result.alert.id).toBe('alert-1');
		expect(result.alert.context).toStrictEqual({
			plan: 'pro',
			activeAlerts: 2,
		});
	});

	it('strips sms channel for free users', async () => {
		vi.mocked(repository.countActiveAlertsByUser).mockResolvedValue(0);
		vi.mocked(repository.createAlertRow).mockResolvedValue({
			...baseRow,
			symbol: 'MSFT',
			channels: JSON.stringify(['email']),
		});

		const result = await createAlert({
			userId: 'user-1',
			plan: 'free',
			input: {
				symbol: 'MSFT',
				triggerType: 'price',
				triggerConfig: { direction: 'above', value: 100 },
				cadence: '5m',
				channels: ['email', 'sms'],
			},
		});

		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected ok');
		expect(repository.createAlertRow).toHaveBeenCalledWith(
			expect.objectContaining({
				channels: JSON.stringify(['email']),
			}),
		);
		expect(result.alert.channels).toStrictEqual(['email']);
	});
});

describe('listAlerts', () => {
	it('returns mapped alerts for a user', async () => {
		vi.mocked(repository.countActiveAlertsByUser).mockResolvedValue(1);
		vi.mocked(repository.listAlerts).mockResolvedValue([
			{
				...baseRow,
				symbol: 'NVDA',
				triggerType: 'percentMove',
				triggerConfig: JSON.stringify({ direction: 'above', value: 5 }),
				cadence: '15m',
				channels: JSON.stringify(['push']),
			},
		]);

		const result = await listAlerts({ userId: 'user-1', plan: 'pro' });
		expect(result).toHaveLength(1);
		expect(result[0]?.symbol).toBe('NVDA');
		expect(result[0]?.context).toStrictEqual({ plan: 'pro', activeAlerts: 1 });
	});
});

describe('toggleAlert', () => {
	it('blocks re-enable when free cap is reached', async () => {
		vi.mocked(repository.countActiveAlertsByUser).mockResolvedValue(5);

		const result = await toggleAlert({
			userId: 'user-1',
			alertId: 'alert-1',
			isActive: true,
			plan: 'free',
		});

		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected cap block');
		expect(result.errorCode).toBe('free_cap_reached');
		expect(repository.toggleAlert).not.toHaveBeenCalled();
	});

	it('allows disable without cap check path failure', async () => {
		vi.mocked(repository.toggleAlert).mockResolvedValue({
			...baseRow,
			isActive: false,
		});
		vi.mocked(repository.countActiveAlertsByUser).mockResolvedValue(3);

		const result = await toggleAlert({
			userId: 'user-1',
			alertId: 'alert-1',
			isActive: false,
			plan: 'free',
		});

		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected ok');
		expect(result.alert.isActive).toBe(false);
	});
});

describe('quickCreateAlertForSymbol', () => {
	it('creates a default price-above alert from symbol', async () => {
		vi.mocked(repository.countActiveAlertsByUser).mockResolvedValue(0);
		vi.mocked(repository.createAlertRow).mockResolvedValue({
			...baseRow,
			symbol: 'TSLA',
			channels: JSON.stringify(['email']),
		});

		const result = await quickCreateAlertForSymbol({
			userId: 'user-1',
			symbol: 'tsla',
			plan: 'pro',
		});

		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected ok');
		expect(repository.createAlertRow).toHaveBeenCalledWith(
			expect.objectContaining({
				symbol: 'TSLA',
				triggerType: 'price',
				cadence: '1m',
			}),
		);
		expect(result.alert.symbol).toBe('TSLA');
		expect(result.alert.channels).toStrictEqual(['email']);
	});
});
