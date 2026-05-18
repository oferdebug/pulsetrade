import { createFileRoute } from '@tanstack/react-router';
import MarketChartCard from '#/components/dashboard/MarketChartCard';
import MarketRow from '#/components/dashboard/MarketRow';
import StatCard from '#/components/dashboard/StatCard';
import {
	marketOverviewData,
	marketsData,
	statsCardsData,
	topMoversData,
	watchlistData,
} from '#/data/mockMarkets';

export const Route = createFileRoute('/')({
	component: DashboardPage,
});

function DashboardPage() {
	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-bold text-white'>Dashboard</h1>
				<p className='mt-1 text-sm text-slate-400'>
					Market overview and portfolio activity.
				</p>
			</div>

			<section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
				{statsCardsData.map((card) => (
					<StatCard
						key={card.title}
						title={card.title}
						value={card.value}
						change={card.change}
					/>
				))}
			</section>

			<div className='grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]'>
				<section className='space-y-6'>
					<MarketChartCard />

					<section className='rounded-2xl border border-slate-800 bg-slate-950 p-5'>
						<div className='mb-4 flex items-center justify-between'>
							<h2 className='text-lg font-semibold text-white'>
								Market Overview
							</h2>
							<span className='text-sm text-slate-400'>Live preview</span>
						</div>

						<div className='space-y-3'>
							{marketOverviewData.map((market) => (
								<MarketRow
									key={market.symbol}
									symbol={market.symbol}
									name={market.name}
									price={market.price}
									change={market.change}
								/>
							))}
						</div>
					</section>
				</section>

				<div className='space-y-6'>
					<section className='rounded-2xl border border-slate-800 bg-slate-950 p-5'>
						<div className='mb-4 flex items-center justify-between'>
							<h2 className='text-lg font-semibold text-white'>Top Movers</h2>
							<span className='text-sm text-slate-400'>Today</span>
						</div>

						<div className='space-y-3'>
							{topMoversData.map((market) => (
								<MarketRow
									compact
									key={market.symbol}
									symbol={market.symbol}
									name={market.name}
									price={market.price}
									change={market.change}
								/>
							))}
						</div>
					</section>

					<section className='rounded-2xl border border-slate-800 bg-slate-950 p-5'>
						<h2 className='mb-4 text-lg font-semibold text-white'>
							Watchlist Preview
						</h2>

						<div className='space-y-3'>
							{watchlistData.map((market) => (
								<MarketRow
									compact
									key={market.symbol}
									symbol={market.symbol}
									name={market.name}
									price={market.price}
									change={market.change}
								/>
							))}
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
