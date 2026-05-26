export type MarketItem = {
	symbol: string;
	name: string;
	price: string;
	change: string;
	sector: 'tech' | 'auto' | 'entertainment';
	volume?: string;
	marketCap?: string;
	sparkline?: number[];
};

export type StatCardItem = {
	title: string;
	value: string;
	change?: string;
};

export const marketOverviewData: MarketItem[] = [
	{
		symbol: 'AAPL',
		name: 'Apple Inc.',
		price: '$196.75',
		change: '+2.34%',
		sector: 'tech',
		volume: '58.2M',
		marketCap: '$3.01T',
		sparkline: [188, 190, 187, 192, 191, 194, 193, 196, 195, 197],
	},
	{
		symbol: 'NVDA',
		name: 'NVIDIA Corporation',
		price: '$456.78',
		change: '+5.67%',
		sector: 'tech',
		volume: '42.1M',
		marketCap: '$1.12T',
		sparkline: [420, 428, 425, 435, 432, 441, 438, 448, 445, 457],
	},
	{
		symbol: 'TSLA',
		name: 'Tesla Inc.',
		price: '$245.67',
		change: '-1.23%',
		sector: 'auto',
		volume: '91.3M',
		marketCap: '$781B',
		sparkline: [252, 250, 254, 251, 249, 248, 250, 247, 246, 246],
	},
];

export const topMoversData: MarketItem[] = [
	{
		symbol: 'META',
		name: 'Meta Platforms',
		price: '$602.12',
		change: '+2.81%',
		sector: 'tech',
		volume: '19.4M',
		marketCap: '$1.54T',
		sparkline: [582, 585, 583, 588, 590, 592, 594, 597, 599, 602],
	},
	{
		symbol: 'MSFT',
		name: 'Microsoft',
		price: '$514.90',
		change: '+1.42%',
		sector: 'tech',
		volume: '22.8M',
		marketCap: '$3.83T',
		sparkline: [505, 507, 506, 509, 508, 510, 511, 512, 513, 515],
	},
];

export const watchlistData: MarketItem[] = [
	{
		symbol: 'AMD',
		name: 'Advanced Micro Devices',
		price: '$156.78',
		change: '+3.45%',
		sector: 'tech',
		volume: '61.5M',
		marketCap: '$254B',
		sparkline: [148, 150, 149, 152, 151, 153, 154, 155, 155, 157],
	},
	{
		symbol: 'NFLX',
		name: 'Netflix',
		price: '$456.78',
		change: '+2.34%',
		sector: 'entertainment',
		volume: '8.9M',
		marketCap: '$198B',
		sparkline: [443, 445, 444, 447, 446, 449, 450, 452, 454, 457],
	},
];

export const statsCardsData: StatCardItem[] = [
	{
		title: 'Portfolio Value',
		value: '$124,530',
		change: '+4.2%',
	},
	{
		title: 'Daily Profit',
		value: '$1,240',
		change: '+1.8%',
	},
	{
		title: 'Watchlist',
		value: '18',
	},
	{
		title: 'Active Alerts',
		value: '6',
	},
];

export const marketsData: MarketItem[] = [
	...marketOverviewData,
	...topMoversData,
	...watchlistData,
];
