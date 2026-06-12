import { describe, expect, it } from 'vitest';

import type { Quote } from '#/lib/market/types';

import { buildActionBoard } from './action-board';

function createQuote(symbol: string, changePercent: number): Quote {
	return {
		symbol,
		name: `${symbol} Inc`,
		price: 100,
		change: changePercent,
		changePercent,
		currency: 'USD',
		asOf: 1_717_000_000_000,
	};
}

describe('buildActionBoard', () => {
	it('returns empty list when quotes are empty', () => {
		expect(buildActionBoard([])).toEqual([]);
	});

	it('returns top momentum, drawdown risk, and volatility candidate rankings', () => {
		const items = buildActionBoard([
			createQuote('AAPL', 3.2),
			createQuote('TSLA', -4.9),
			createQuote('MSFT', 1.1),
		]);

		expect(items).toEqual([
			{
				symbol: 'AAPL',
				reason: 'Top momentum',
				score: 3.2,
			},
			{
				symbol: 'TSLA',
				reason: 'Drawdown risk',
				score: 4.9,
			},
			{
				symbol: 'TSLA',
				reason: 'Volatility candidate',
				score: 4.9,
			},
		]);
	});
});
