import type {
	ChartRange,
	MarketStatus,
	OHLCVBar,
	Quote,
	SymbolSearchResult,
} from './types';

export interface MarketProvider {
	getQuote(symbol: string): Promise<Quote>;
	getQuotes(symbols: string[]): Promise<Quote[]>;
	getOHLCV(symbol: string, range: ChartRange): Promise<OHLCVBar[]>;
	searchSymbols(query: string): Promise<SymbolSearchResult[]>;
	getMarketStatus(): Promise<MarketStatus>;
}
