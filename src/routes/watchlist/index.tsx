import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import MarketRow from '#/components/dashboard/MarketRow';
import Button from '#/components/ui/Button';
import { useWatchlistStore } from '#/store/watchlistStore';

export const Route = createFileRoute('/watchlist/')({
	component: WatchListPage,
});

function WatchListPage() {
	const items = useWatchlistStore((state) => state.items);
	const removeFromWatchlist = useWatchlistStore(
		(state) => state.removeFromWatchlist,
	);
	const hasWatchlistItems = items.length > 0;
	return (
		<div className={'space-y-7'}>
			<div>
				<h1 className={'text-2xl font-bold text-white'}>Watchlist</h1>
				<p className={'mt-1 text-sm text-slate-400'}>
					Track saved assets and monitor price movement.
				</p>
			</div>
			<section
				className={'rounded-2xl border border-slate-800 bg-slate-950 p-5'}
			>
				<div className={'mb-4 flex items-center justify-between'}>
					<div>
						<h2 className={'text-lg font-semibold text-white'}>
							Saved Symbols
						</h2>
						<p className={'mt-1 text-sm text-slate-400'}>
							{items.length} assets in your Watchlist
						</p>
					</div>
				</div>
				{hasWatchlistItems ? (
					<div className={'space-y-3'}>
						{items.map((market) => (
							<MarketRow
								key={market.symbol}
								symbol={market.symbol}
								name={market.name}
								price={market.price}
								change={market.change}
								action={
									<Button
										variant='danger'
										className={'px-3 py-1 text-xs'}
										onClick={() => {
											removeFromWatchlist(market.symbol);
											toast.success(`${market.symbol} remove from watchlist`);
										}}
									>
										Remove
									</Button>
								}
							/>
						))}
					</div>
				) : (
					<div
						className={
							'rounded-xl border border-dashed border-slate-700 p-8 text-center'
						}
					>
						<h3 className={'text-lg font-semibold text-white'}>
							No symbols saved yet
						</h3>
						<p className={'mt-2 text-sm text-slate-400'}>
							Add assets from the Markets page to start tracking them here.
						</p>
					</div>
				)}
			</section>
		</div>
	);
}
