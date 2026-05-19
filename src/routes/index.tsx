import { createFileRoute } from '@tanstack/react-router';
import MarketChartCard from '#/components/dashboard/MarketChartCard';
import MarketRow from '#/components/dashboard/MarketRow';
import StatCard from '#/components/dashboard/StatCard';
import Card from '#/components/ui/Card';
import SectionHeader from '#/components/ui/SectionHeader';
import {
	marketOverviewData,
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

					<Card>
						<SectionHeader
							title='Market Overview'
							rightSlot={
								<span className='text-sm text-slate-400'>Live preview</span>
							}
						/>

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
					</Card>
				</section>

				<div className='space-y-6'>
					<Card>
						<SectionHeader
							title='Top Movers'
							rightSlot={<span className='text-sm text-slate-400'>Today</span>}
						/>
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
					</Card>

					<Card>
						<SectionHeader title='Watchlist Preview' />

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
					</Card>
				</div>
			</div>
		</div>
	);
}
