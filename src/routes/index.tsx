import { createFileRoute } from '@tanstack/react-router';
import MarketRow from '#/components/dashboard/MarketRow';
import StatCard from '#/components/dashboard/StatCard';

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
				<StatCard title='Portfolio Value' value='$124,530' change='+4.2%' />
				<StatCard title='Daily Profit' value='$1,240' change='+1.8%' />
				<StatCard title='Watchlist' value='18' />
				<StatCard title='Active Alerts' value='6' />
			</section>

			<div className='grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]'>
				<section className='rounded-2xl border border-slate-800 bg-slate-950 p-5'>
					<div className='mb-4 flex items-center justify-between'>
						<h2 className='text-lg font-semibold text-white'>
							Market Overview
						</h2>
						<span className='text-sm text-slate-400'>Live preview</span>
					</div>

					<div className='space-y-3'>
						<MarketRow
							symbol='AAPL'
							name='Apple Inc.'
							price='$196.45'
							change='+1.24%'
						/>
						<MarketRow
							symbol='NVDA'
							name='NVIDIA Corp.'
							price='$142.80'
							change='+3.91%'
						/>
						<MarketRow
							symbol='TSLA'
							name='Tesla Inc.'
							price='$183.21'
							change='-0.84%'
						/>
					</div>
				</section>

				<div className='space-y-6'>
					<section className='rounded-2xl border border-slate-800 bg-slate-950 p-5'>
						<div className='mb-4 flex items-center justify-between'>
							<h2 className='text-lg font-semibold text-white'>Top Movers</h2>
							<span className='text-sm text-slate-400'>Today</span>
						</div>

						<div className='space-y-3'>
							<MarketRow
								symbol='META'
								name='Meta Platforms'
								price='$602.12'
								change='+2.81%'
							/>
							<MarketRow
								symbol='MSFT'
								name='Microsoft'
								price='$514.90'
								change='+1.42%'
							/>
						</div>
					</section>

					<section className='rounded-2xl border border-slate-800 bg-slate-950 p-5'>
						<h2 className='mb-4 text-lg font-semibold text-white'>
							Watchlist Preview
						</h2>

						<div className='space-y-3'>
							<MarketRow
								symbol='AMD'
								name='Advanced Micro Devices'
								price='$164.20'
								change='+4.11%'
							/>
							<MarketRow
								symbol='NFLX'
								name='Netflix'
								price='$882.14'
								change='-1.08%'
							/>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
