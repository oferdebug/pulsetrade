import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { TtlCache } from './cache';
import { getMarketProvider } from './index';
import type { Quote } from './types';

const quoteCache = new TtlCache();
const QUOTE_TTL_MS = 30_000;
type QuoteEnvelope = {
	quote: Quote;
	stale: boolean;
};

const symbolSchema = z.object({ symbol: z.string().min(1).max(12) });
const symbolsSchema = z.object({
	symbols: z.array(z.string().min(1).max(12)).min(1).max(50),
});
const ohlcvSchema = z.object({
	symbol: z.string().min(1).max(12),
	range: z.enum(['1d', '1w', '1m', '1y']),
});
const searchSchema = z.object({ query: z.string().min(1).max(64) });
const dashboardSnapshotSchema = z.object({
	symbols: z.array(z.string()).min(1).max(50),
});

async function loadQuote(symbol: string): Promise<Quote> {
	const envelope = await loadQuoteEnvelope(symbol);
	return envelope.quote;
}

async function loadQuoteEnvelope(symbol: string): Promise<QuoteEnvelope> {
	const key = `quote:${symbol}`;
	const cached = quoteCache.get<Quote>(key);
	try {
		const quote = await getMarketProvider().getQuote(symbol);
		quoteCache.set(key, quote, QUOTE_TTL_MS);
		return { quote, stale: false };
	} catch (error) {
		if (cached) {
			return { quote: cached, stale: true };
		}
		throw error;
	}
}

export const getQuote = createServerFn({ method: 'GET' })
	.inputValidator((data: unknown) => symbolSchema.parse(data))
	.handler(({ data }) => loadQuote(data.symbol.toUpperCase()));

export const getQuotes = createServerFn({ method: 'GET' })
	.inputValidator((data: unknown) => symbolsSchema.parse(data))
	.handler(({ data }) =>
		Promise.all(data.symbols.map((s) => loadQuote(s.toUpperCase()))),
	);

export const getOHLCV = createServerFn({ method: 'GET' })
	.inputValidator((data: unknown) => ohlcvSchema.parse(data))
	.handler(({ data }) =>
		getMarketProvider().getOHLCV(data.symbol.toUpperCase(), data.range),
	);

export const searchSymbols = createServerFn({ method: 'GET' })
	.inputValidator((data: unknown) => searchSchema.parse(data))
	.handler(({ data }) => getMarketProvider().searchSymbols(data.query));

export const getMarketStatus = createServerFn({ method: 'GET' }).handler(() =>
	getMarketProvider().getMarketStatus(),
);

export async function buildDashboardSnapshot(symbols: string[]) {
	const normalizedSymbols = symbols.map((symbol) => symbol.toUpperCase());
	const [quoteEnvelopes, status] = await Promise.all([
		Promise.all(normalizedSymbols.map((symbol) => loadQuoteEnvelope(symbol))),
		getMarketProvider().getMarketStatus(),
	]);
	const quotes = quoteEnvelopes.map((envelope) => envelope.quote);
	const isStale = quoteEnvelopes.some((envelope) => envelope.stale);

	return {
		quotes,
		status,
		refreshedAt: Date.now(),
		isStale,
	};
}

export const getDashboardSnapshot = createServerFn({ method: 'GET' })
	.inputValidator((data: unknown) => dashboardSnapshotSchema.parse(data))
	.handler(({ data }) => buildDashboardSnapshot(data.symbols));
