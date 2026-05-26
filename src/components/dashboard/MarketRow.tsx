import { TrendingDown, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';

type MarketRowProps = {
	symbol: string;
	name: string;
	price: string;
	change: string;
	compact?: boolean;
	action?: ReactNode;
};

export default function MarketRow({
	symbol,
	name,
	price,
	change,
	compact = false,
	action,
}: MarketRowProps) {
	const isPositive = change.startsWith('+');
	const TrendIcon = isPositive ? TrendingUp : TrendingDown;

	return (
		<div
			className={`flex items-center justify-between rounded-2xl border border-white/6 bg-slate-900/70 transition hover:bg-slate-800/60 ${
				compact ? 'px-4 py-3' : 'px-5 py-4'
			}`}
		>
			<div>
				<h3 className='text-sm font-bold tracking-wide text-white'>{symbol}</h3>
				<p className='mt-0.5 truncate text-xs text-slate-500'>{name}</p>
			</div>

			<div className='flex shrink-0 items-center gap-3 self-center'>
				<div className='flex flex-col items-end'>
					<p className='text-sm font-bold tabular-nums text-white'>{price}</p>
					<span
						className={`mt-0.5 flex items-center gap-1 text-xs font-semibold tabular-nums ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}
					>
						<TrendIcon size={10} aria-hidden='true' />
						{change}
					</span>
				</div>
				{action ? <div className='shrink-0'>{action}</div> : null}
			</div>
		</div>
	);
}
