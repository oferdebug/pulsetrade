import type { MarketProvider } from '../provider';
import type {
	ChartRange,
	MarketStatus,
	OHLCVBar,
	Quote,
	SymbolSearchResult,
} from '../types';

const NOT_IMPLEMENTED = 'PolygonProvider not implemented yet';

export class PolygonProvider implements MarketProvider {
	// biome-ignore lint/complexity/noUselessConstructor: apiKey slot kept for real implementation
	constructor(_apiKey: string) {}

	getQuote(_symbol: string): Promise<Quote> {
		throw new Error(NOT_IMPLEMENTED);
	}

	getQuotes(_symbols: string[]): Promise<Quote[]> {
		throw new Error(NOT_IMPLEMENTED);
	}

	getOHLCV(_symbol: string, _range: ChartRange): Promise<OHLCVBar[]> {
		throw new Error(NOT_IMPLEMENTED);
	}

	searchSymbols(_query: string): Promise<SymbolSearchResult[]> {
		throw new Error(NOT_IMPLEMENTED);
	}

	getMarketStatus(): Promise<MarketStatus> {
		throw new Error(NOT_IMPLEMENTED);
	}
}
