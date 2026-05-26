import { Link, createFileRoute } from '@tanstack/react-router';
import {
	ChevronLeft,
	ChevronRight,
	LayoutGrid,
	LayoutList,
	Search,
	SlidersHorizontal,
	Star,
	TrendingDown,
	TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Sparkline from '#/components/ui/Sparkline';
import { marketsData } from '#/data/mockMarkets';
import { useWatchlistStore } from '#/store/watchlistStore';

const SECTORS = [
	{ label: 'All', value: '' },
	{ label: 'Technology', value: 'tech' },
	{ label: 'Auto', value: 'auto' },
	{ label: 'Entertainment', value: 'entertainment' },
] as const;

export const Route = createFileRoute('/markets/')({
	validateSearch: (search) => ({
		query: String(search.query ?? ''),
		sector: String(search.sector ?? ''),
		sort: String(search.sort ?? ''),
		page: Math.max(
			1,
			Number.isFinite(Number(search.page)) ? Number(search.page) : 1,
		),
	}),
	component: MarketsPage,
});

function MarketsPage() {
	const search = Route.useSearch();
	const currentPage = search.page;
	const navigate = Route.useNavigate();
	const [view, setView] = useState<'list' | 'grid'>('list');
	const [addedSymbol, setAddedSymbol] = useState<string | null>(null);

	const addToWatchlist = useWatchlistStore((state) => state.addToWatchlist);
	const removeFromWatchlist = useWatchlistStore((state) => state.removeFromWatchlist);
	const isInWatchlist = useWatchlistStore((state) => state.isInWatchlist);

	const filteredMarkets = marketsData.filter((market) => {
		const query = search.query.toLowerCase();
		const matchesQuery =
			market.symbol.toLowerCase().includes(query) ||
			market.name.toLowerCase().includes(query);
		const matchesSector =
			!search.sector ||
			market.sector.toLowerCase() === search.sector.toLowerCase();
		return matchesQuery && matchesSector;
	});

	const sortedMarkets = [...filteredMarkets].sort((a, b) => {
		if (search.sort === 'symbol') return a.symbol.localeCompare(b.symbol);
		if (search.sort === 'price-desc')
			return Number(b.price.replace('$', '').replace(',', '')) - Number(a.price.replace('$', '').replace(',', ''));
		if (search.sort === 'price-asc')
			return Number(a.price.replace('$', '').replace(',', '')) - Number(b.price.replace('$', '').replace(',', ''));
		return 0;
	});

	const itemsPerPage = view === 'grid' ? 6 : 8;
	const totalPages = Math.ceil(sortedMarkets.length / itemsPerPage);
	const paginatedMarkets = sortedMarkets.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	function handleStarToggle(market: typeof marketsData[0], e: React.MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (isInWatchlist(market.symbol)) {
			removeFromWatchlist(market.symbol);
			toast.success(`${market.symbol} removed from watchlist`);
		} else {
			addToWatchlist(market);
			setAddedSymbol(market.symbol);
			setTimeout(() => setAddedSymbol(null), 600);
			toast.success(`${market.symbol} added to watchlist`);
		}
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-end justify-between'>
				<div>
					<h1 className='text-2xl font-bold text-white'>Markets</h1>
					<p className='mt-1 text-sm text-slate-400'>
						Track performance, search assets and monitor trends.
					</p>
				</div>
				<div className='flex items-center gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-1'>
					<button
						type='button'
						onClick={() => setView('list')}
						aria-pressed={view === 'list'}
						className={`cursor-pointer rounded-lg p-1.5 transition ${view === 'list' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
						aria-label='List view'
					>
						<LayoutList size={14} aria-hidden='true' />
					</button>
					<button
						type='button'
						onClick={() => setView('grid')}
						aria-pressed={view === 'grid'}
						className={`cursor-pointer rounded-lg p-1.5 transition ${view === 'grid' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
						aria-label='Grid view'
					>
						<LayoutGrid size={14} aria-hidden='true' />
					</button>
				</div>
			</div>

			<section className='rounded-3xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-xl'>
				<div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
					<div className='flex flex-col gap-3 md:flex-row'>
						<div className='relative'>
							<Search size={14} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500' aria-hidden='true' />
							<input
								type='text'
								placeholder='Search symbol or name…'
								className='w-full rounded-xl border border-white/5 bg-white/[0.03] py-2 pl-9 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-blue-500/10 md:w-60'
								value={search.query}
								onChange={(e) =>
									navigate({ search: (prev) => ({ ...prev, query: e.target.value, page: 1 }) })
								}
							/>
						</div>
						<div className='relative flex items-center'>
							<SlidersHorizontal size={14} className='absolute left-3.5 text-slate-500' aria-hidden='true' />
							<select
								className='cursor-pointer appearance-none rounded-xl border border-white/5 bg-white/[0.03] py-2 pl-9 pr-8 text-sm text-slate-300 outline-none transition focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10'
								value={search.sort}
								onChange={(e) =>
									navigate({ search: (prev) => ({ ...prev, sort: e.target.value, page: 1 }) })
								}
							>
								<option value=''>Default</option>
								<option value='symbol'>Symbol A–Z</option>
								<option value='price-desc'>Price High → Low</option>
								<option value='price-asc'>Price Low → High</option>
							</select>
						</div>
					</div>
					<div className='flex flex-wrap items-center gap-2'>
						{SECTORS.map((s) => {
							const isActive = search.sector === s.value;
							return (
								<button
									key={s.value}
									type='button'
									onClick={() =>
										navigate({ search: (prev) => ({ ...prev, sector: s.value, page: 1 }) })
									}
									className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
										isActive
											? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
											: 'border border-white/5 bg-white/[0.03] text-slate-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white'
									}`}
								>
									{s.label}
								</button>
							);
						})}
					</div>
				</div>

				<div className='mt-5 mb-3 flex items-center justify-between'>
					<p className='text-xs font-medium text-slate-500'>
						{filteredMarkets.length} result{filteredMarkets.length !== 1 ? 's' : ''}
					</p>
				</div>

				{paginatedMarkets.length === 0 ? (
					<div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 py-14 text-center'>
						<Search size={28} className='text-slate-600' aria-hidden='true' />
						<p className='text-sm font-semibold text-white'>No results found</p>
						<p className='text-xs text-slate-500'>Try a different symbol or clear filters.</p>
					</div>
				) : view === 'list' ? (
					<div className='overflow-hidden rounded-2xl border border-white/5'>
						<div className='grid grid-cols-[1fr_auto_auto_auto_64px_40px] items-center gap-4 border-b border-white/5 px-4 py-2'>
							<p className='text-[10px] font-semibold uppercase tracking-widest text-slate-600'>Asset</p>
							<p className='w-20 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-600'>Price</p>
							<p className='w-16 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-600'>Change</p>
							<p className='hidden w-16 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-600 sm:block'>Volume</p>
							<p className='text-right text-[10px] font-semibold uppercase tracking-widest text-slate-600'>7D</p>
							<span />
						</div>
						{paginatedMarkets.map((market) => {
							const isPos = market.change.startsWith('+');
							const TrendIcon = isPos ? TrendingUp : TrendingDown;
							const watched = isInWatchlist(market.symbol);
							const justAdded = addedSymbol === market.symbol;
							return (
								<Link
									key={market.symbol}
									to='/markets/$symbol'
									params={{ symbol: market.symbol.toLowerCase() }}
									className='group grid grid-cols-[1fr_auto_auto_auto_64px_40px] items-center gap-4 border-b border-white/[0.04] px-4 py-3 transition-all last:border-0 hover:bg-white/[0.04]'
								>
									<div className='min-w-0'>
										<p className='font-semibold text-white'>{market.symbol}</p>
										<p className='truncate text-xs text-slate-500'>{market.name}</p>
									</div>
									<p className='w-20 text-right font-semibold tabular-nums text-white'>{market.price}</p>
									<span className={`flex w-16 items-center justify-end gap-1 text-xs font-semibold tabular-nums ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
										<TrendIcon size={11} aria-hidden='true' />
										{market.change}
									</span>
									<p className='hidden w-16 text-right text-xs tabular-nums text-slate-500 sm:block'>{market.volume ?? '—'}</p>
									<div className='flex justify-end'>
										{market.sparkline && (
											<Sparkline data={market.sparkline} positive={isPos} width={64} height={28} />
										)}
									</div>
									<button
										type='button'
										onClick={(e) => handleStarToggle(market, e)}
										aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
										className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 ${
											watched
												? 'text-amber-400 hover:text-amber-300'
												: 'text-slate-600 hover:text-slate-300 group-hover:text-slate-400'
										} ${justAdded ? 'scale-125' : 'scale-100'}`}
									>
										<Star size={14} fill={watched ? 'currentColor' : 'none'} aria-hidden='true' />
									</button>
								</Link>
							);
						})}
					</div>
				) : (
					<div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
						{paginatedMarkets.map((market) => {
							const isPos = market.change.startsWith('+');
							const TrendIcon = isPos ? TrendingUp : TrendingDown;
							const watched = isInWatchlist(market.symbol);
							const justAdded = addedSymbol === market.symbol;
							return (
								<Link
									key={market.symbol}
									to='/markets/$symbol'
									params={{ symbol: market.symbol.toLowerCase() }}
									className='group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-white/10 hover:bg-white/[0.06]'
								>
									<div className='flex items-start justify-between'>
										<div>
											<p className='font-bold text-white'>{market.symbol}</p>
											<p className='mt-0.5 truncate text-xs text-slate-500'>{market.name}</p>
										</div>
										<button
											type='button'
											onClick={(e) => handleStarToggle(market, e)}
											aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
											className={`cursor-pointer rounded-lg p-1 transition-all duration-200 ${
												watched ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'
											} ${justAdded ? 'scale-125' : 'scale-100'}`}
										>
											<Star size={14} fill={watched ? 'currentColor' : 'none'} aria-hidden='true' />
										</button>
									</div>
									<div className='mt-3 flex items-end justify-between'>
										<div>
											<p className='text-lg font-bold tabular-nums text-white'>{market.price}</p>
											<span className={`flex items-center gap-1 text-xs font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
												<TrendIcon size={11} aria-hidden='true' />
												{market.change}
											</span>
										</div>
										{market.sparkline && (
											<Sparkline data={market.sparkline} positive={isPos} width={72} height={32} />
										)}
									</div>
									{market.volume && (
										<p className='mt-2 text-[10px] tabular-nums text-slate-600'>Vol: {market.volume}</p>
									)}
								</Link>
							);
						})}
					</div>
				)}

				{totalPages > 1 && (
					<div className='mt-5 flex items-center gap-3'>
						<button
							type='button'
							disabled={currentPage === 1}
							onClick={() =>
								navigate({ search: (prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }) })
							}
							className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] text-slate-400 transition hover:border-white/10 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40'
							aria-label='Previous page'
						>
							<ChevronLeft size={14} aria-hidden='true' />
						</button>
						<p className='text-xs text-slate-500'>
							Page <span className='font-semibold text-white'>{currentPage}</span> of{' '}
							<span className='font-semibold text-white'>{Math.max(1, totalPages)}</span>
						</p>
						<button
							type='button'
							disabled={currentPage >= totalPages}
							onClick={() =>
								navigate({ search: (prev) => ({ ...prev, page: prev.page + 1 }) })
							}
							className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] text-slate-400 transition hover:border-white/10 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40'
							aria-label='Next page'
						>
							<ChevronRight size={14} aria-hidden='true' />
						</button>
					</div>
				)}
			</section>
		</div>
	);
}
