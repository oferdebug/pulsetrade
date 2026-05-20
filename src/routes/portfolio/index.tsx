import { createFileRoute } from '@tanstack/react-router';
import MarketRow from '#/components/dashboard/MarketRow';
import StatCard from '#/components/dashboard/StatCard';

const portfolioStats = [
	{ title: 'Total Balance', value: '$86,320', change: '+7.8%' },
	{ title: 'Invested', value: '$62,450' },
	{ title: 'Cash', value: '$23,870' },
	{ title: 'Holdings', value: '7' },
];

const holdings = [
	{ symbol: 'AAPL', name: 'Apple Inc.', price: '$196.75', change: '+2.34%' },
	{
		symbol: 'NVDA',
		name: 'NVIDIA Corporation',
		price: '$456.78',
		change: '+5.67%',
	},
	{ symbol: 'TSLA', name: 'Tesla Inc.', price: '$245.67', change: '-1.23%' },
];

export const Route = createFileRoute('/portfolio/')({
	component: PortfolioPage,
});

function PortfolioPage() {
	return (
		<div className={'space-y-8'}>
			<div>
				<h1 className={'text-2xl font-bold text-white'}>Portfolio</h1>
				<p className={'mt-1 text-sm text-slate-400'}>
					Track simulated holdings, allocation and portfolio performance.
				</p>
			</div>

			<section className={'grid gap-4 md:grid-cols-2 xl:grid-cols-4'}>
				{portfolioStats.map((stat) => (
					<StatCard
						key={stat.title}
						title={stat.title}
						value={stat.value}
						change={stat.change}
					/>
				))}
			</section>

			<section
				className={'rounded-2xl border border-slate-800 bg-slate-950 p-5'}
			>
				<div className={'mb-4 flex items-center justify-between'}>
					<div>
						<h2 className={'text-lg font-semibold text-white'}>Holdings</h2>
						<p className={'mt-1 text-sm text-slate-400'}>
							Your Simulated portfolio positions
						</p>
					</div>
				</div>
				<div className={'space-y-4'}>
					{holdings.map((holding) => (
						<MarketRow
							key={holding.symbol}
							symbol={holding.symbol}
							name={holding.name}
							price={holding.price}
							change={holding.change}
						/>
					))}
				</div>
			</section>
		</div>
	);
}

export default PortfolioPage;
