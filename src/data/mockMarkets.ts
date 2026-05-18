export const marketOverviewData = [
	{
		symbol: 'AAPL',
		name: 'Apple Inc.',
		price: '$196.75',
		change: '+2.34%',
		sector: 'Tech',
	},
	{
		symbol: 'NVDA',
		name: 'NVIDIA Corporation',
		price: '$456.78',
		change: '+5.67%',
		sector: 'Tech',
	},
	{
		symbol: 'TSLA',
		name: 'Tesla Inc.',
		price: '$245.67',
		change: '-1.23%',
		sector: 'Auto',
	},
];

export const topMoversData = [
	{
		symbol: 'META',
		name: 'Meta Platforms',
		price: '$602.12',
		change: '+2.81%',
		sector: 'Tech',
	},
	{
		symbol: 'MSFT',
		name: 'Microsoft',
		price: '$514.90',
		change: '+1.42%',
		sector: 'Tech',
	},
];

export const watchlistData = [
	{
		symbol: 'AMD',
		name: 'Advanced Micro Devices',
		price: '$156.78',
		change: '+3.45%',
		sector: 'Tech',
	},
	{
		symbol: 'NFLX',
		name: 'Netflix',
		price: '$456.78',
		change: '+2.34%',
		sector: 'Entertainment',
	},
];

export const statsCardsData = [
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

export const marketsData = [
	...marketOverviewData,
	...topMoversData,
	...watchlistData,
];
