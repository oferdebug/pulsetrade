import { describe, expect, it } from 'vitest';
import { evaluateAlert } from './evaluator';

describe('evaluateAlert', () => {
	it('fires only on false->true transition for price-above', () => {
		const first = evaluateAlert(
			{
				triggerType: 'price',
				triggerConfig: { direction: 'above', value: 100 },
				lastState: 'normal',
			},
			{ price: 101, changePercent: 0, volume: 10_000, baselineVolume: 8_000 },
		);
		expect(first.shouldFire).toBe(true);
		expect(first.nextState).toBe('triggered');
		const second = evaluateAlert(
			{
				triggerType: 'price',
				triggerConfig: { direction: 'above', value: 100 },
				lastState: 'triggered',
			},
			{ price: 105, changePercent: 0, volume: 11_000, baselineVolume: 8_000 },
		);
		expect(second.shouldFire).toBe(false);
		expect(second.nextState).toBe('triggered');
	});
});
