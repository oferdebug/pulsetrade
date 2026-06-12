import { Link } from '@tanstack/react-router';
import Card from '#/components/ui/Card';
import SectionHeader from '#/components/ui/SectionHeader';
import type { ActionItem } from '#/lib/dashboard/action-board';
import type { Quote } from '#/lib/market/types';

type ActionBoardProps = {
	items: ActionItem[];
	quotesBySymbol: Map<string, Quote>;
};

function formatPrice(price: number, currency: string) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		maximumFractionDigits: 2,
	}).format(price);
}

function formatChangePercent(changePercent: number) {
	const sign = changePercent >= 0 ? '+' : '';
	return `${sign}${changePercent.toFixed(2)}%`;
}

export default function ActionBoard({
	items,
	quotesBySymbol,
}: ActionBoardProps) {
	return (
		<Card>
			<SectionHeader
				title='Action Board'
				description='Ranked opportunities from your live watchlist.'
			/>
			{items.length === 0 ? (
				<div className='rounded-2xl border border-white/6 bg-white/[0.02] p-4 text-sm text-slate-400'>
					No actionable symbols yet. Add symbols to your watchlist to get ranked
					signals.
				</div>
			) : (
				<div className='space-y-3'>
					{items.map((item) => {
						const quote = quotesBySymbol.get(item.symbol);
						const changeClass =
							quote && quote.changePercent < 0
								? 'text-rose-400'
								: 'text-emerald-400';
						return (
							<div
								key={`${item.reason}:${item.symbol}`}
								className='flex items-center justify-between gap-4 rounded-2xl border border-white/6 bg-slate-900/70 px-4 py-3'
							>
								<div>
									<p className='text-sm font-semibold text-white'>
										{item.symbol}
									</p>
									<p className='mt-1 text-xs text-slate-400'>{item.reason}</p>
								</div>
								<div className='flex items-center gap-4'>
									{quote ? (
										<div className='text-right'>
											<p className='text-sm font-semibold text-white'>
												{formatPrice(quote.price, quote.currency)}
											</p>
											<p className={`text-xs font-medium ${changeClass}`}>
												{formatChangePercent(quote.changePercent)}
											</p>
										</div>
									) : null}
									<Link
										to='/markets'
										search={{
											query: item.symbol,
											sector: '',
											sort: '',
											page: 1,
										}}
										className='rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]'
									>
										Open chart
									</Link>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</Card>
	);
}
