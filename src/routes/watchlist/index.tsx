import { createFileRoute, Link } from '@tanstack/react-router';
import {
	ArrowDownUp,
	ArrowRight,
	Star,
	Trash2,
	TrendingDown,
	TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Sparkline from '#/components/ui/Sparkline';
import { useWatchlistStore } from '#/store/watchlistStore';

export const Route = createFileRoute('/watchlist/')({
	component: WatchListPage,
});

type SortKey =
	| 'default'
	| 'change-desc'
	| 'change-asc'
	| 'price-desc'
	| 'alpha';

function WatchListPage() {
	const items = useWatchlistStore((state) => state.items);
	const removeFromWatchlist = useWatchlistStore(
		(state) => state.removeFromWatchlist,
	);
	const [sort, setSort] = useState<SortKey>('default');
	const [removing, setRemoving] = useState<string | null>(null);

	const sorted = [...items].sort((a, b) => {
		if (sort === 'alpha') return a.symbol.localeCompare(b.symbol);
		if (sort === 'price-desc')
			return (
				Number(b.price.replace(/[$,]/g, '')) -
				Number(a.price.replace(/[$,]/g, ''))
			);
		const toNum = (c: string) => Number(c.replace('%', '').replace('+', ''));
		if (sort === 'change-desc') return toNum(b.change) - toNum(a.change);
		if (sort === 'change-asc') return toNum(a.change) - toNum(b.change);
		return 0;
	});

	const gainers = items.filter((i) => i.change.startsWith('+')).length;
	const losers = items.length - gainers;
	const avgChange =
		items.length === 0
			? 0
			: items.reduce(
					(acc, i) => acc + Number(i.change.replace('%', '').replace('+', '')),
					0,
				) / items.length;
	const avgPositive = avgChange >= 0;

	function handleRemove(symbol: string) {
		setRemoving(symbol);
		setTimeout(() => {
			removeFromWatchlist(symbol);
			setRemoving(null);
			toast.success(`${symbol} removed from watchlist`);
		}, 220);
	}

	function handleClearAll() {
		for (const item of items) removeFromWatchlist(item.symbol);
		toast.success('Watchlist cleared');
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-end justify-between'>
				<div>
					<h1 className='text-2xl font-bold text-white'>Watchlist</h1>
					<p className='mt-1 text-sm text-slate-400'>
						Track saved assets and monitor price movement.
					</p>
				</div>
				{items.length > 0 && (
					<button
						type='button'
						onClick={handleClearAll}
						className='flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-500/15 bg-rose-500/[0.06] px-3 py-1.5 text-xs font-medium text-rose-400 transition hover:border-rose-500/30 hover:bg-rose-500/10'
					>
						<Trash2 size={11} aria-hidden='true' />
						Clear all
					</button>
				)}
			</div>

			{items.length > 0 && (
				<div className='grid grid-cols-3 gap-3'>
					<div className='rounded-2xl border border-white/5 bg-white/[0.02] p-4'>
						<p className='text-xs text-slate-500'>Tracked</p>
						<p className='mt-1 text-2xl font-bold tabular-nums text-white'>
							{items.length}
						</p>
					</div>
					<div className='rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.04] p-4'>
						<p className='text-xs text-emerald-600'>Gainers</p>
						<p className='mt-1 text-2xl font-bold tabular-nums text-emerald-400'>
							{gainers}
						</p>
					</div>
					<div className='rounded-2xl border border-rose-500/10 bg-rose-500/[0.04] p-4'>
						<p className='text-xs text-rose-600'>Losers</p>
						<p className='mt-1 text-2xl font-bold tabular-nums text-rose-400'>
							{losers}
						</p>
					</div>
				</div>
			)}

			{items.length > 0 && (
				<div
					className={`flex items-center justify-between rounded-2xl border px-5 py-3 ${avgPositive ? 'border-emerald-500/10 bg-emerald-500/[0.04]' : 'border-rose-500/10 bg-rose-500/[0.04]'}`}
				>
					<p className='text-xs text-slate-400'>
						Avg. daily change across watchlist
					</p>
					<div
						className={`flex items-center gap-1.5 font-bold tabular-nums ${avgPositive ? 'text-emerald-400' : 'text-rose-400'}`}
					>
						{avgPositive ? (
							<TrendingUp size={14} aria-hidden='true' />
						) : (
							<TrendingDown size={14} aria-hidden='true' />
						)}
						{avgPositive ? '+' : ''}
						{avgChange.toFixed(2)}%
					</div>
				</div>
			)}

			<section className='rounded-3xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-xl'>
				<div className='mb-5 flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<h2 className='text-base font-semibold text-white'>
							Saved Symbols
						</h2>
						<span className='rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs font-semibold tabular-nums text-slate-400'>
							{items.length}
						</span>
					</div>
					{items.length > 1 && (
						<div className='flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.03] p-1'>
							<ArrowDownUp
								size={11}
								className='ml-1 text-slate-500'
								aria-hidden='true'
							/>
							<select
								value={sort}
								onChange={(e) => setSort(e.target.value as SortKey)}
								className='cursor-pointer appearance-none bg-transparent pr-2 text-xs text-slate-400 outline-none'
							>
								<option value='default'>Default</option>
								<option value='change-desc'>Best movers</option>
								<option value='change-asc'>Worst movers</option>
								<option value='price-desc'>Price high→low</option>
								<option value='alpha'>A–Z</option>
							</select>
						</div>
					)}
				</div>

				{sorted.length > 0 ? (
					<div className='space-y-2'>
						{sorted.map((market) => {
							const isPos = market.change.startsWith('+');
							const TrendIcon = isPos ? TrendingUp : TrendingDown;
							const isRemoving = removing === market.symbol;
							return (
								<div
									key={market.symbol}
									className={`transition-all duration-200 ${isRemoving ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
								>
									<Link
										to='/markets/$symbol'
										params={{ symbol: market.symbol.toLowerCase() }}
										className='group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 transition hover:border-white/10 hover:bg-white/[0.05]'
									>
										<div className='min-w-0'>
											<p className='font-semibold text-white'>
												{market.symbol}
											</p>
											<p className='truncate text-xs text-slate-500'>
												{market.name}
											</p>
										</div>

										<div className='flex shrink-0 items-center gap-4'>
											{market.sparkline && (
												<Sparkline
													data={market.sparkline}
													positive={isPos}
													width={56}
													height={24}
												/>
											)}
											<div className='w-20 text-right'>
												<p className='font-semibold tabular-nums text-white'>
													{market.price}
												</p>
												<span
													className={`flex items-center justify-end gap-1 text-xs font-semibold tabular-nums ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}
												>
													<TrendIcon size={11} aria-hidden='true' />
													{market.change}
												</span>
											</div>
											<button
												type='button'
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													handleRemove(market.symbol);
												}}
												aria-label={`Remove ${market.symbol} from watchlist`}
												className='cursor-pointer rounded-xl border border-transparent p-1.5 text-slate-600 opacity-0 transition hover:border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100'
											>
												<Trash2 size={13} aria-hidden='true' />
											</button>
										</div>
									</Link>
								</div>
							);
						})}
					</div>
				) : (
					<div className='flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 py-16 text-center'>
						<div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]'>
							<Star size={22} className='text-slate-500' aria-hidden='true' />
						</div>
						<div>
							<h3 className='text-sm font-semibold text-white'>
								No symbols saved yet
							</h3>
							<p className='mt-1 text-xs text-slate-500'>
								Add assets from the Markets page to start tracking them here.
							</p>
						</div>
						<Link
							to='/markets'
							search={{ query: '', sector: '', sort: '', page: 1 }}
							className='flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/10 hover:bg-white/[0.07] hover:text-white'
						>
							Browse Markets
							<ArrowRight size={12} aria-hidden='true' />
						</Link>
					</div>
				)}
			</section>
		</div>
	);
}
