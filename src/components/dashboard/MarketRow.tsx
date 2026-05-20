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
	return (
		<div
			className={`flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 ${
				compact ? 'px-3 py-2' : 'px-4 py-3'
			}`}
		>
			<div>
				<h3
					className={
						compact
							? 'text-sm font-semibold text-white'
							: 'font-semibold text-white'
					}
				>
					{symbol}
				</h3>
				<p
					className={
						compact
							? 'truncate text-xs text-slate-400'
							: 'truncate text-sm text-slate-300'
					}
				>
					{name}
				</p>
			</div>

			<div
				className={'flex shrink-0 items-center gap-3 self-center text-right'}
			>
				<div className={'flex min-w-[72px] flex-col items-end'}>
					<p className={'font-semibold text-white'}>{price}</p>
					<p
						className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}
					>
						{change}
					</p>
				</div>
				{action ? <div className={'shrink-0'}>{action}</div> : null}
			</div>
		</div>
	);
}
