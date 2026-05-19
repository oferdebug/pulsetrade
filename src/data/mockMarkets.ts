export type MarketItem = {
	symbol: string;
	name: string;
	price: string;
	change: string;
	sector: 'tech' | 'auto' | 'entertainment';
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
	},
	{
		symbol: 'NVDA',
		name: 'NVIDIA Corporation',
		price: '$456.78',
		change: '+5.67%',
		sector: 'tech',
	},
	{
		symbol: 'TSLA',
		name: 'Tesla Inc.',
		price: '$245.67',
		change: '-1.23%',
		sector: 'auto',
	},
];

export const topMoversData: MarketItem[] = [
	{
		symbol: 'META',
		name: 'Meta Platforms',
		price: '$602.12',
		change: '+2.81%',
		sector: 'tech',
	},
	{
		symbol: 'MSFT',
		name: 'Microsoft',
		price: '$514.90',
		change: '+1.42%',
		sector: 'tech',
	},
];

export const watchlistData: MarketItem[] = [
	{
		symbol: 'AMD',
		name: 'Advanced Micro Devices',
		price: '$156.78',
		change: '+3.45%',
		sector: 'tech',
	},
	{
		symbol: 'NFLX',
		name: 'Netflix',
		price: '$456.78',
		change: '+2.34%',
		sector: 'entertainment',
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
