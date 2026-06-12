import { createFileRoute, Link } from '@tanstack/react-router';
import {
	BarChart2,
	DollarSign,
	PieChart,
	TrendingDown,
	TrendingUp,
	Wallet,
} from 'lucide-react';
import StatCard from '#/components/dashboard/StatCard';
import Sparkline from '#/components/ui/Sparkline';

const holdings = [
	{
		symbol: 'AAPL',
		name: 'Apple Inc.',
		price: '$196.75',
		change: '+2.34%',
		value: 32450,
		cost: 29800,
		shares: 165,
		sparkline: [188, 190, 187, 192, 191, 194, 193, 196, 195, 197],
	},
	{
		symbol: 'NVDA',
		name: 'NVIDIA Corporation',
		price: '$456.78',
		change: '+5.67%',
		value: 18600,
		cost: 15200,
		shares: 40,
		sparkline: [420, 428, 425, 435, 432, 441, 438, 448, 445, 457],
	},
	{
		symbol: 'TSLA',
		name: 'Tesla Inc.',
		price: '$245.67',
		change: '-1.23%',
		value: 11400,
		cost: 12100,
		shares: 46,
		sparkline: [252, 250, 254, 251, 249, 248, 250, 247, 246, 246],
	},
];

const DONUT_COLORS = ['#3b82f6', '#34d399', '#f87171', '#a78bfa', '#fb923c'];
const totalValue = holdings.reduce((s, h) => s + h.value, 0);
const totalCost = holdings.reduce((s, h) => s + h.cost, 0);
const totalPnL = totalValue - totalCost;
const totalPnLPct = ((totalPnL / totalCost) * 100).toFixed(2);
const isPnLPos = totalPnL >= 0;

function DonutChart() {
	const cx = 56;
	const cy = 56;
	const r = 44;
	const gap = 2;
	const circumference = 2 * Math.PI * r;
	let offset = 0;
	const slices = holdings.map((h, i) => {
		const pct = h.value / totalValue;
		const len = pct * (circumference - holdings.length * gap);
		const slice = {
			offset,
			len,
			color: DONUT_COLORS[i % DONUT_COLORS.length],
			symbol: h.symbol,
		};
		offset += len + gap;
		return slice;
	});

	return (
		<svg viewBox='0 0 112 112' className='h-28 w-28' aria-hidden='true'>
			{slices.map((s) => (
				<circle
					key={s.symbol}
					cx={cx}
					cy={cy}
					r={r}
					fill='none'
					stroke={s.color}
					strokeWidth='12'
					strokeDasharray={`${s.len} ${circumference - s.len}`}
					strokeDashoffset={-s.offset}
					strokeLinecap='round'
					style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
				/>
			))}
			<text
				x={cx}
				y={cy - 4}
				textAnchor='middle'
				className='fill-white text-[9px] font-bold'
				fontSize='9'
				fontWeight='bold'
				fill='white'
			>
				{((holdings[0].value / totalValue) * 100).toFixed(0)}%
			</text>
			<text x={cx} y={cy + 8} textAnchor='middle' fontSize='7' fill='#64748b'>
				{holdings[0].symbol}
			</text>
		</svg>
	);
}

const portfolioStats = [
	{
		title: 'Total Value',
		value: `$${totalValue.toLocaleString()}`,
		change: `${isPnLPos ? '+' : ''}${totalPnLPct}%`,
		icon: Wallet,
	},
	{
		title: 'Invested',
		value: `$${totalCost.toLocaleString()}`,
		icon: BarChart2,
	},
	{
		title: 'P&L',
		value: `${isPnLPos ? '+' : ''}$${Math.abs(totalPnL).toLocaleString()}`,
		change: `${isPnLPos ? '+' : ''}${totalPnLPct}%`,
		icon: TrendingUp,
	},
	{ title: 'Holdings', value: String(holdings.length), icon: PieChart },
];

export const Route = createFileRoute('/portfolio/')({
	component: PortfolioPage,
});

function PortfolioPage() {
	return (
		<div className='space-y-8'>
			<div>
				<h1 className='text-2xl font-bold text-white'>Portfolio</h1>
				<p className='mt-1 text-sm text-slate-400'>
					Track simulated holdings, allocation and performance.
				</p>
			</div>

			<section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
				{portfolioStats.map((stat) => (
					<StatCard
						key={stat.title}
						title={stat.title}
						value={stat.value}
						change={stat.change}
						icon={stat.icon}
					/>
				))}
			</section>

			<section className='rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl'>
				<div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
					<div>
						<h2 className='text-base font-semibold text-white'>Holdings</h2>
						<p className='mt-0.5 text-xs text-slate-500'>
							Your simulated portfolio positions.
						</p>
					</div>
					<div className='flex items-center gap-6'>
						<DonutChart />
						<div className='space-y-2'>
							{holdings.map((h, i) => (
								<div key={h.symbol} className='flex items-center gap-2'>
									<span
										className='h-2 w-2 rounded-full'
										style={{
											background: DONUT_COLORS[i % DONUT_COLORS.length],
										}}
									/>
									<p className='text-xs text-slate-400'>{h.symbol}</p>
									<p className='text-xs font-semibold tabular-nums text-white'>
										{((h.value / totalValue) * 100).toFixed(1)}%
									</p>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className='space-y-3'>
					{holdings.map((holding, i) => {
						const isPos = holding.change.startsWith('+');
						const TrendIcon = isPos ? TrendingUp : TrendingDown;
						const pnl = holding.value - holding.cost;
						const pnlPct = ((pnl / holding.cost) * 100).toFixed(2);
						const isPnlPos = pnl >= 0;
						const allocationPct = Math.round(
							(holding.value / totalValue) * 100,
						);

						return (
							<div key={holding.symbol} className='space-y-1.5'>
								<Link
									to='/markets/$symbol'
									params={{ symbol: holding.symbol.toLowerCase() }}
									className='group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3.5 transition hover:border-white/10 hover:bg-white/[0.05]'
								>
									<div className='flex items-center gap-3'>
										<div
											className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white'
											style={{
												background: `${DONUT_COLORS[i % DONUT_COLORS.length]}22`,
												color: DONUT_COLORS[i % DONUT_COLORS.length],
											}}
										>
											{holding.symbol.slice(0, 2)}
										</div>
										<div>
											<p className='font-semibold text-white'>
												{holding.symbol}
											</p>
											<p className='text-xs text-slate-500'>
												{holding.shares} shares · {holding.name}
											</p>
										</div>
									</div>

									<div className='flex shrink-0 items-center gap-4'>
										{holding.sparkline && (
											<Sparkline
												data={holding.sparkline}
												positive={isPos}
												width={56}
												height={24}
											/>
										)}
										<div className='text-right'>
											<p className='font-semibold tabular-nums text-white'>
												{holding.price}
											</p>
											<span
												className={`flex items-center justify-end gap-1 text-xs font-semibold tabular-nums ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}
											>
												<TrendIcon size={11} aria-hidden='true' />
												{holding.change}
											</span>
										</div>
										<div className='hidden text-right sm:block'>
											<p className='font-semibold tabular-nums text-white'>
												${holding.value.toLocaleString()}
											</p>
											<span
												className={`text-xs font-semibold tabular-nums ${isPnlPos ? 'text-emerald-400' : 'text-rose-400'}`}
											>
												{isPnlPos ? '+' : ''}${pnl.toLocaleString()} (
												{isPnlPos ? '+' : ''}
												{pnlPct}%)
											</span>
										</div>
									</div>
								</Link>
								<div className='flex items-center gap-3 px-1'>
									<div className='h-1 flex-1 overflow-hidden rounded-full bg-white/[0.05]'>
										<div
											className='h-full rounded-full transition-all duration-700'
											style={{
												width: `${allocationPct}%`,
												background: DONUT_COLORS[i % DONUT_COLORS.length],
												opacity: 0.6,
											}}
										/>
									</div>
									<span className='w-8 shrink-0 text-right text-[10px] tabular-nums text-slate-500'>
										{allocationPct}%
									</span>
								</div>
							</div>
						);
					})}
				</div>

				<div
					className={`mt-6 flex items-center justify-between rounded-2xl border px-5 py-4 ${isPnLPos ? 'border-emerald-500/10 bg-emerald-500/[0.04]' : 'border-rose-500/10 bg-rose-500/[0.04]'}`}
				>
					<div className='flex items-center gap-2'>
						<DollarSign
							size={14}
							className={isPnLPos ? 'text-emerald-500' : 'text-rose-500'}
							aria-hidden='true'
						/>
						<p className='text-sm text-slate-300'>Total unrealised P&L</p>
					</div>
					<div
						className={`flex items-center gap-2 font-bold tabular-nums ${isPnLPos ? 'text-emerald-400' : 'text-rose-400'}`}
					>
						{isPnLPos ? (
							<TrendingUp size={15} aria-hidden='true' />
						) : (
							<TrendingDown size={15} aria-hidden='true' />
						)}
						{isPnLPos ? '+' : ''}${Math.abs(totalPnL).toLocaleString()} (
						{isPnLPos ? '+' : ''}
						{totalPnLPct}%)
					</div>
				</div>
			</section>
		</div>
	);
}
