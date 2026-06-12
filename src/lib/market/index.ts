import type { MarketProvider } from './provider';
import { FinnhubProvider } from './providers/finnhub';
import { PolygonProvider } from './providers/polygon';

let cached: MarketProvider | null = null;

export function getMarketProvider(): MarketProvider {
	if (cached) {
		return cached;
	}

	const apiKey = process.env.MARKET_DATA_API_KEY;
	if (!apiKey) {
		throw new Error('MARKET_DATA_API_KEY is required');
	}

	const providerName = process.env.MARKET_DATA_PROVIDER ?? 'finnhub';

	switch (providerName) {
		case 'polygon':
			cached = new PolygonProvider(apiKey);
			break;
		default:
			cached = new FinnhubProvider(apiKey);
			break;
	}

	return cached;
}
