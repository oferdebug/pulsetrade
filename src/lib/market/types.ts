export type AssetClass = 'stock' | 'etf' | 'crypto';

export interface Quote {
	symbol: string;
	name: string;
	price: number;
	change: number;
	changePercent: number;
	currency: string;
	asOf: number;
}

export interface OHLCVBar {
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

export type ChartRange = '1d' | '1w' | '1m' | '1y';

export interface SymbolSearchResult {
	symbol: string;
	name: string;
	assetClass: AssetClass;
}

export type MarketSession = 'pre' | 'open' | 'after' | 'closed';

export interface MarketStatus {
	session: MarketSession;
	isOpen: boolean;
	asOf: number;
}
