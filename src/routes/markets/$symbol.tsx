import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, BarChart2, TrendingUp } from 'lucide-react';

export const Route = createFileRoute('/markets/$symbol')({
	component: MarketSymbolPage,
});

const mockStats: Record<
	string,
	{
		price: string;
		change: string;
		cap: string;
		volume: string;
		high52: string;
		low52: string;
	}
> = {
	AAPL: {
		price: '$196.75',
		change: '+2.34%',
		cap: '$3.01T',
		volume: '58.2M',
		high52: '$220.20',
		low52: '$164.08',
	},
	NVDA: {
		price: '$456.78',
		change: '+5.67%',
		cap: '$1.12T',
		volume: '42.1M',
		high52: '$505.48',
		low52: '$222.97',
	},
	TSLA: {
		price: '$245.67',
		change: '-1.23%',
		cap: '$781B',
		volume: '91.3M',
		high52: '$299.29',
		low52: '$138.80',
	},
};

function MarketSymbolPage() {
	const { symbol } = Route.useParams();
	const upper = symbol.toUpperCase();
	const stats = mockStats[upper];
	const isPositive = stats ? stats.change.startsWith('+') : true;

	return (
		<div className='space-y-6'>
			<div className='flex items-center gap-3'>
				<Link
					to='/markets'
					search={{ query: '', sector: '', sort: '', page: 1 }}
					className='flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-white/10 hover:text-white'
				>
					<ArrowLeft size={12} aria-hidden='true' />
					Markets
				</Link>
			</div>

			<div className='flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
				<div>
					<p className='text-xs font-semibold uppercase tracking-widest text-slate-500'>
						Equity
					</p>
					<h1 className='mt-1 text-4xl font-bold text-white'>{upper}</h1>
				</div>
				{stats ? (
					<div className='flex items-end gap-4'>
						<p className='text-3xl font-bold tabular-nums text-white'>
							{stats.price}
						</p>
						<span
							className={`mb-1 rounded-full px-3 py-1 text-sm font-semibold ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}
						>
							{stats.change}
						</span>
					</div>
				) : null}
			</div>

			<div className='grid gap-6 lg:grid-cols-[1fr_280px]'>
				<section className='relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl'>
					<div className='mb-4 flex items-center gap-2'>
						<BarChart2
							size={14}
							className='text-slate-500'
							aria-hidden='true'
						/>
						<p className='text-xs font-semibold uppercase tracking-widest text-slate-500'>
							Price Chart
						</p>
					</div>
					<div className='flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]'>
						<div className='text-center'>
							<TrendingUp
								size={28}
								className='mx-auto text-slate-700'
								aria-hidden='true'
							/>
							<p className='mt-2 text-xs text-slate-600'>Chart coming soon</p>
						</div>
					</div>
				</section>

				<section className='rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl'>
					<p className='mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500'>
						Key Statistics
					</p>
					{stats ? (
						<div className='space-y-0 divide-y divide-white/5'>
							{[
								{ label: 'Market Cap', value: stats.cap },
								{ label: 'Volume', value: stats.volume },
								{ label: '52W High', value: stats.high52 },
								{ label: '52W Low', value: stats.low52 },
							].map(({ label, value }) => (
								<div
									key={label}
									className='flex items-center justify-between py-3'
								>
									<p className='text-xs text-slate-500'>{label}</p>
									<p className='text-sm font-semibold tabular-nums text-white'>
										{value}
									</p>
								</div>
							))}
						</div>
					) : (
						<p className='text-sm text-slate-500'>
							No data available for {upper}.
						</p>
					)}
				</section>
			</div>
		</div>
	);
}
