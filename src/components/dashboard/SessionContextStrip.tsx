import { getSessionBadge } from '#/lib/dashboard/session';
import type { MarketStatus } from '#/lib/market/types';

type SessionContextStripProps = {
	status: MarketStatus | null;
	refreshedAt: number | null;
	isStale?: boolean;
};

function formatTimestamp(value: number | null) {
	if (!value) return 'Not refreshed yet';
	return new Intl.DateTimeFormat('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit',
	}).format(value);
}

export default function SessionContextStrip({
	status,
	refreshedAt,
	isStale = false,
}: SessionContextStripProps) {
	const badge = getSessionBadge(status);
	const healthLabel = isStale ? 'Data stale' : 'Live';
	const healthClass = isStale
		? 'bg-amber-500/10 text-amber-300'
		: 'bg-emerald-500/10 text-emerald-300';

	return (
		<div className='flex flex-wrap items-center gap-3 rounded-2xl border border-white/6 bg-slate-900/60 px-4 py-3 text-xs'>
			<span
				className={`rounded-full px-3 py-1 font-semibold ${badge.className}`}
			>
				{badge.label}
			</span>
			<span className='text-slate-400'>
				Last refresh: {formatTimestamp(refreshedAt)}
			</span>
			<span className={`rounded-full px-3 py-1 font-semibold ${healthClass}`}>
				{healthLabel}
			</span>
			<span className='rounded-full border border-white/10 px-3 py-1 text-slate-400'>
				Density: Comfortable
			</span>
		</div>
	);
}
