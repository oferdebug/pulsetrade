import type { MarketProvider } from '../provider';
import type {
	ChartRange,
	MarketStatus,
	OHLCVBar,
	Quote,
	SymbolSearchResult,
} from '../types';

const DAY_SECONDS = 24 * 60 * 60;

function parseIsOpen(value: unknown): boolean {
	if (typeof value === 'boolean') {
		return value;
	}
	if (typeof value === 'number') {
		return value === 1;
	}
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase();
		if (normalized === 'true' || normalized === '1') {
			return true;
		}
		if (normalized === 'false' || normalized === '0') {
			return false;
		}
	}
	return false;
}

function parseTimestamp(value: unknown): number | null {
	let parsed: number | null = null;

	if (typeof value === 'number' && Number.isFinite(value)) {
		parsed = value;
	} else if (typeof value === 'string') {
		const num = Number(value);
		if (Number.isFinite(num)) {
			parsed = num;
		}
	}

	if (parsed === null) {
		return null;
	}
	if (parsed <= 0) {
		return null;
	}

	// Finnhub commonly returns Unix seconds; preserve milliseconds when already in ms.
	return parsed < 1_000_000_000_000
		? Math.floor(parsed * 1000)
		: Math.floor(parsed);
}

function resolveRange(range: ChartRange): {
	resolution: string;
	from: number;
	to: number;
} {
	const to = Math.floor(Date.now() / 1000);
	switch (range) {
		case '1d':
			return { resolution: '5', from: to - DAY_SECONDS, to };
		case '1w':
			return { resolution: '30', from: to - 7 * DAY_SECONDS, to };
		case '1m':
			return { resolution: 'D', from: to - 30 * DAY_SECONDS, to };
		case '1y':
			return { resolution: 'W', from: to - 365 * DAY_SECONDS, to };
		default:
			return { resolution: 'D', from: to - 30 * DAY_SECONDS, to };
	}
}

export class FinnhubProvider implements MarketProvider {
	constructor(private apiKey: string) {}

	async getQuote(symbol: string): Promise<Quote> {
		const res = await fetch(
			`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.apiKey}`,
		);
		if (!res.ok) {
			throw new Error(`Finnhub quote failed: ${res.status}`);
		}
		const raw = await res.json();

		return {
			symbol,
			name: symbol,
			price: raw.c,
			change: raw.d,
			changePercent: raw.dp,
			currency: 'USD',
			asOf: raw.t * 1000,
		};
	}

	getQuotes(symbols: string[]): Promise<Quote[]> {
		// Finnhub's free tier has no batch quote endpoint, so fan out.
		return Promise.all(symbols.map((symbol) => this.getQuote(symbol)));
	}

	async getOHLCV(symbol: string, range: ChartRange): Promise<OHLCVBar[]> {
		const { resolution, from, to } = resolveRange(range);
		const res = await fetch(
			`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${this.apiKey}`,
		);
		if (!res.ok) {
			throw new Error(`Finnhub candles failed: ${res.status}`);
		}
		const raw = await res.json();

		if (raw.s !== 'ok') {
			return [];
		}

		return raw.t.map((time: number, i: number) => ({
			time,
			open: raw.o[i],
			high: raw.h[i],
			low: raw.l[i],
			close: raw.c[i],
			volume: raw.v[i],
		}));
	}

	async searchSymbols(query: string): Promise<SymbolSearchResult[]> {
		const res = await fetch(
			`https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${this.apiKey}`,
		);
		if (!res.ok) {
			throw new Error(`Finnhub search failed: ${res.status}`);
		}
		const raw = await res.json();

		if (!Array.isArray(raw.result)) {
			return [];
		}

		return raw.result.flatMap((item: unknown): SymbolSearchResult[] => {
			if (typeof item !== 'object' || item === null) {
				return [];
			}

			const symbol = 'symbol' in item ? item.symbol : null;
			const description = 'description' in item ? item.description : null;
			if (typeof symbol !== 'string' || typeof description !== 'string') {
				return [];
			}

			const normalizedSymbol = symbol.trim();
			const normalizedDescription = description.trim();
			if (!normalizedSymbol || !normalizedDescription) {
				return [];
			}

			return [
				{
					symbol: normalizedSymbol,
					name: normalizedDescription,
					assetClass: 'stock',
				},
			];
		});
	}

	async getMarketStatus(): Promise<MarketStatus> {
		const res = await fetch(
			`https://finnhub.io/api/v1/stock/market-status?exchange=US&token=${this.apiKey}`,
		);
		if (!res.ok) {
			throw new Error(`Finnhub market status failed: ${res.status}`);
		}
		const raw = await res.json();
		const isOpen = parseIsOpen(raw.isOpen);
		const asOf =
			parseTimestamp(raw.t) ?? parseTimestamp(raw.timestamp) ?? Date.now();

		return {
			session: isOpen ? 'open' : 'closed',
			isOpen,
			asOf,
		};
	}
}
