import { afterEach, describe, expect, it, vi } from 'vitest';

import { FinnhubProvider } from './finnhub';

function stubFetch(payload: unknown, ok = true, status = 200): void {
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({
			ok,
			status,
			json: async () => payload,
		}),
	);
}

describe('FinnhubProvider', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it('maps searchSymbols response', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({
				result: [
					{ symbol: 'AAPL', description: 'Apple Inc' },
					{ symbol: 'MSFT', description: 'Microsoft Corporation' },
				],
			}),
		});
		vi.stubGlobal('fetch', fetchMock);

		const provider = new FinnhubProvider('test-api-key');
		const result = await provider.searchSymbols('app');

		expect(fetchMock).toHaveBeenCalledWith(
			'https://finnhub.io/api/v1/search?q=app&token=test-api-key',
		);
		expect(result).toEqual([
			{ symbol: 'AAPL', name: 'Apple Inc', assetClass: 'stock' },
			{
				symbol: 'MSFT',
				name: 'Microsoft Corporation',
				assetClass: 'stock',
			},
		]);
	});

	it('handles malformed searchSymbols payload', async () => {
		stubFetch({
			result: [
				{ symbol: 'AAPL', description: 'Apple Inc' },
				{ symbol: 123, description: 'Bad Symbol' },
				{ symbol: 'MSFT', description: null },
				{ symbol: '   ', description: 'Empty Symbol' },
			],
		});

		const provider = new FinnhubProvider('test-api-key');
		const result = await provider.searchSymbols('tech');

		expect(result).toEqual([
			{ symbol: 'AAPL', name: 'Apple Inc', assetClass: 'stock' },
		]);
	});

	it('returns empty array for non-array search result', async () => {
		stubFetch({ result: { symbol: 'AAPL', description: 'Apple Inc' } });

		const provider = new FinnhubProvider('test-api-key');
		await expect(provider.searchSymbols('app')).resolves.toEqual([]);
	});

	it('throws on non-OK searchSymbols response', async () => {
		stubFetch({}, false, 429);

		const provider = new FinnhubProvider('test-api-key');
		await expect(provider.searchSymbols('app')).rejects.toThrow(
			'Finnhub search failed: 429',
		);
	});

	it('maps getMarketStatus response', async () => {
		stubFetch({
			isOpen: true,
			t: 1717000000,
		});
		const provider = new FinnhubProvider('test-api-key');
		const result = await provider.getMarketStatus();

		expect(result).toEqual({
			session: 'open',
			isOpen: true,
			asOf: 1717000000 * 1000,
		});
	});

	it('uses isOpen for session despite session field variants', async () => {
		const provider = new FinnhubProvider('test-api-key');

		stubFetch({ isOpen: true, session: 'pre-market', t: 1717000000 });
		await expect(provider.getMarketStatus()).resolves.toMatchObject({
			session: 'open',
		});

		stubFetch({ isOpen: true, session: 'regular', t: 1717000000 });
		await expect(provider.getMarketStatus()).resolves.toMatchObject({
			session: 'open',
		});

		stubFetch({ isOpen: false, session: 'after-hours', t: 1717000000 });
		await expect(provider.getMarketStatus()).resolves.toMatchObject({
			session: 'closed',
		});

		stubFetch({ isOpen: false, session: 'closed', t: 1717000000 });
		await expect(provider.getMarketStatus()).resolves.toMatchObject({
			session: 'closed',
		});
	});

	it('uses isOpen for session despite sessionType field', async () => {
		const provider = new FinnhubProvider('test-api-key');

		stubFetch({ isOpen: false, sessionType: 'postmarket', t: 1717000000 });
		await expect(provider.getMarketStatus()).resolves.toMatchObject({
			session: 'closed',
		});

		stubFetch({
			isOpen: true,
			session: 'unknown',
			sessionType: null,
			t: 1717000000,
		});
		await expect(provider.getMarketStatus()).resolves.toMatchObject({
			session: 'open',
		});
	});

	it('falls back timestamp to Date.now for invalid values', async () => {
		const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1717999999999);
		stubFetch({ isOpen: false, session: 'closed', t: 'invalid' });

		const provider = new FinnhubProvider('test-api-key');
		const result = await provider.getMarketStatus();

		expect(result.asOf).toBe(1717999999999);
		nowSpy.mockRestore();
	});

	it('throws on non-OK getMarketStatus response', async () => {
		stubFetch({}, false, 500);

		const provider = new FinnhubProvider('test-api-key');
		await expect(provider.getMarketStatus()).rejects.toThrow(
			'Finnhub market status failed: 500',
		);
	});
});
