import type { Quote } from '#/lib/market/types';
import MarketRow from './MarketRow';

type WatchlistRadarProps = {
	quotes: Quote[];
};

function formatPrice(price: number, currency: string) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		maximumFractionDigits: 2,
	}).format(price);
}

function formatChange(change: number, changePercent: number) {
	const changeSign = change >= 0 ? '+' : '';
	const percentSign = changePercent >= 0 ? '+' : '';
	return `${changeSign}${change.toFixed(2)} (${percentSign}${changePercent.toFixed(2)}%)`;
}

export default function WatchlistRadar({ quotes }: WatchlistRadarProps) {
	if (quotes.length === 0) {
		return (
			<div className='rounded-2xl border border-white/6 bg-white/[0.02] p-4 text-sm text-slate-400'>
				No watchlist symbols available yet.
			</div>
		);
	}

	const sorted = [...quotes].sort(
		(a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent),
	);

	return (
		<div className='space-y-3'>
			{sorted.map((quote) => (
				<MarketRow
					compact
					key={quote.symbol}
					symbol={quote.symbol}
					name={quote.name}
					price={formatPrice(quote.price, quote.currency)}
					change={formatChange(quote.change, quote.changePercent)}
				/>
			))}
		</div>
	);
}
