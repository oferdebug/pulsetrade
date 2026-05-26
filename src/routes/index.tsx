import { createFileRoute } from '@tanstack/react-router';
import { Bell, Briefcase, DollarSign, Star } from 'lucide-react';
import MarketChartCard from '#/components/dashboard/MarketChartCard';
import MarketRow from '#/components/dashboard/MarketRow';
import StatCard from '#/components/dashboard/StatCard';
import Card from '#/components/ui/Card';
import SectionHeader from '#/components/ui/SectionHeader';
import Sparkline from '#/components/ui/Sparkline';
import {
	marketOverviewData,
	statsCardsData,
	topMoversData,
	watchlistData,
} from '#/data/mockMarkets';

const statIcons = [Briefcase, DollarSign, Star, Bell] as const;

const marketPulse = [
	{
		label: 'Market Breadth',
		value: '72%',
		change: '+4.8%',
		data: [32, 38, 35, 48, 52, 61, 58, 72],
	},
	{
		label: 'Volatility',
		value: '14.2',
		change: '-2.1%',
		data: [72, 68, 64, 58, 54, 44, 38, 32],
		positive: false,
	},
];

export const Route = createFileRoute('/')({
	component: DashboardPage,
});

function DashboardPage() {
	return (
		<div className='space-y-8'>
			<section className='flex flex-col justify-between gap-4 xl:flex-row xl:items-end'>
				<div>
					<p className='text-xs font-semibold uppercase tracking-[0.28em] text-blue-300/80'>
						PulseTrade Dashboard
					</p>
					<h1 className='mt-3 text-4xl font-bold tracking-tight text-white'>
						Market command center
					</h1>
					<p className='mt-3 max-w-2xl text-sm leading-6 text-slate-400'>
						Track market momentum, portfolio movement, and watchlist activity
						from one focused trading workspace.
					</p>
				</div>

				<div className='rounded-full border border-emerald-400/10 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300'>
					Live session active
				</div>
			</section>

			<section
				className={
					'grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_420px]'
				}
			>
				<MarketChartCard />

				<div className='space-y-4'>
					<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-1'>
						{statsCardsData.slice(0, 2).map((card, index) => (
							<StatCard
								key={card.title}
								title={card.title}
								value={card.value}
								change={card.change}
								icon={statIcons[index]}
							/>
						))}
					</div>

					<Card>
						<SectionHeader
							title='Market Pulse'
							description='Current market health indicators'
						/>

						<div className='space-y-4'>
							{marketPulse.map((item) => (
								<div
									key={item.label}
									className='rounded-2xl border border-white/5 bg-white/[0.025] p-4'
								>
									<div className='flex items-center justify-between gap-4'>
										<div>
											<p className='text-xs font-medium uppercase tracking-[0.18em] text-slate-500'>
												{item.label}
											</p>
											<div className='mt-2 flex items-end gap-2'>
												<p className='text-2xl font-bold text-white'>
													{item.value}
												</p>
												<p
													className={
														item.positive === false
															? 'text-sm font-semibold text-rose-400'
															: 'text-sm font-semibold text-emerald-400'
													}
												>
													{item.change}
												</p>
											</div>
										</div>

										<Sparkline
											data={item.data}
											positive={item.positive !== false}
											width={96}
											height={42}
										/>
									</div>
								</div>
							))}
						</div>
					</Card>
				</div>
			</section>

			<section className='grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]'>
				<Card>
					<SectionHeader
						title='Market Overview'
						description='Most relevant symbols across the current session'
						rightSlot={
							<span className='text-sm text-slate-500'>Live preview</span>
						}
					/>

					<div className='grid gap-3 lg:grid-cols-2'>
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

				<div className='space-y-6'>
					<Card>
						<SectionHeader
							title='Top Movers'
							rightSlot={<span className='text-sm text-slate-500'>Today</span>}
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
			</section>
		</div>
	);
}
