import { createFileRoute } from '@tanstack/react-router';
import { Bell, Briefcase, DollarSign, Star } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import ActionBoard from '#/components/dashboard/ActionBoard';
import MarketChartCard from '#/components/dashboard/MarketChartCard';
import SessionContextStrip from '#/components/dashboard/SessionContextStrip';
import StatCard from '#/components/dashboard/StatCard';
import WatchlistRadar from '#/components/dashboard/WatchlistRadar';
import Card from '#/components/ui/Card';
import SectionHeader from '#/components/ui/SectionHeader';
import Sparkline from '#/components/ui/Sparkline';
import { statsCardsData } from '#/data/mockMarkets';
import { buildActionBoard } from '#/lib/dashboard/action-board';
import { useDashboardSessionStore } from '#/lib/dashboard/session';
import { getDashboardSnapshot } from '#/lib/market/server';
import type { MarketStatus, Quote } from '#/lib/market/types';

const statIcons = [Briefcase, DollarSign, Star, Bell] as const;
const PULSE_SYMBOLS = ['SPY', 'QQQ', 'VIX'] as const;
const WATCHLIST_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN'] as const;
const DASHBOARD_SYMBOLS = [
	...new Set([...PULSE_SYMBOLS, ...WATCHLIST_SYMBOLS]),
];

export const Route = createFileRoute('/')({
	component: DashboardPage,
});

type DashboardSnapshot = {
	quotes: Quote[];
	status: MarketStatus;
	refreshedAt: number;
	isStale: boolean;
};

type DashboardViewModel = {
	pulseQuotes: Quote[];
	watchlistQuotes: Quote[];
	actionItems: ReturnType<typeof buildActionBoard>;
};

export function deriveDashboardView(
	snapshot: DashboardSnapshot,
): DashboardViewModel {
	const pulseSet = new Set(PULSE_SYMBOLS);
	const watchlistSet = new Set(WATCHLIST_SYMBOLS);
	const pulseQuotes: Quote[] = [];
	const watchlistQuotes: Quote[] = [];

	for (const quote of snapshot.quotes) {
		if (pulseSet.has(quote.symbol as (typeof PULSE_SYMBOLS)[number])) {
			pulseQuotes.push(quote);
		}
		if (watchlistSet.has(quote.symbol as (typeof WATCHLIST_SYMBOLS)[number])) {
			watchlistQuotes.push(quote);
		}
	}

	return {
		pulseQuotes,
		watchlistQuotes,
		actionItems: buildActionBoard(watchlistQuotes),
	};
}

function formatSignedPercent(value: number) {
	const sign = value >= 0 ? '+' : '';
	return `${sign}${value.toFixed(2)}%`;
}

function safeNumber(value: unknown, fallback = 0): number {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}
	if (typeof value === 'string') {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}
	return fallback;
}

function DashboardPage() {
	const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isStale, setIsStale] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const hasLoadedSnapshotRef = useRef(false);
	const setSessionSnapshot = useDashboardSessionStore(
		(state) => state.setSessionSnapshot,
	);

	const refreshMs = snapshot?.status.isOpen ? 30_000 : 180_000;

	useEffect(() => {
		let cancelled = false;

		const loadSnapshot = async () => {
			try {
				const next = await getDashboardSnapshot({
					data: { symbols: [...DASHBOARD_SYMBOLS] },
				});
				if (cancelled) return;
				setSnapshot(next);
				setSessionSnapshot(next.status, next.refreshedAt);
				hasLoadedSnapshotRef.current = true;
				setLoadError(null);
				setIsStale(next.isStale);
			} catch (_error) {
				if (cancelled) return;
				setLoadError('Live dashboard data is temporarily unavailable.');
				setIsStale(hasLoadedSnapshotRef.current);
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		};

		void loadSnapshot();
		const timer = window.setInterval(() => {
			void loadSnapshot();
		}, refreshMs);

		return () => {
			cancelled = true;
			window.clearInterval(timer);
		};
	}, [refreshMs, setSessionSnapshot]);

	const viewModel = useMemo(
		() => (snapshot ? deriveDashboardView(snapshot) : null),
		[snapshot],
	);

	const pulseCards = useMemo(() => {
		if (!viewModel) return [];
		return viewModel.pulseQuotes.map((quote) => {
			const price = safeNumber(quote.price);
			const change = safeNumber(quote.change);
			const changePercent = safeNumber(quote.changePercent);
			return {
				label: quote.symbol,
				value: price.toFixed(2),
				change: formatSignedPercent(changePercent),
				data: [
					price - change,
					price - change * 0.6,
					price - change * 0.35,
					price,
				],
				positive: changePercent >= 0,
			};
		});
	}, [viewModel]);

	return (
		<div className='space-y-8'>
			<section className='flex flex-col justify-between gap-4 xl:flex-row xl:items-end'>
				<div>
					<p className='text-xs font-semibold uppercase tracking-[0.28em] text-blue-300/80'>
						PulseTrade Dashboard
					</p>
					<h1 className='mt-3 text-4xl font-bold tracking-tight text-white'>
						Market command center
					</h1>
					<p className='mt-3 max-w-2xl text-sm leading-6 text-slate-400'>
						Track market momentum, portfolio movement, and watchlist activity
						from one focused trading workspace.
					</p>
				</div>

				<div className='rounded-full border border-emerald-400/10 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300'>
					{isLoading ? 'Loading market session...' : 'Live snapshot active'}
				</div>
			</section>

			<section
				className={
					'grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_420px]'
				}
			>
				<MarketChartCard />

				<div className='space-y-4'>
					<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-1'>
						{statsCardsData.slice(0, 2).map((card, index) => (
							<StatCard
								key={card.title}
								title={card.title}
								value={card.value}
								change={card.change}
								icon={statIcons[index]}
							/>
						))}
					</div>

					<Card>
						<SectionHeader
							title='Market Pulse'
							description='Current market health indicators'
						/>

						<div className='space-y-4'>
							{pulseCards.length > 0 ? (
								pulseCards.map((item) => (
									<div
										key={item.label}
										className='rounded-2xl border border-white/5 bg-white/[0.025] p-4'
									>
										<div className='flex items-center justify-between gap-4'>
											<div>
												<p className='text-xs font-medium uppercase tracking-[0.18em] text-slate-500'>
													{item.label}
												</p>
												<div className='mt-2 flex items-end gap-2'>
													<p className='text-2xl font-bold text-white'>
														{item.value}
													</p>
													<p
														className={
															item.positive === false
																? 'text-sm font-semibold text-rose-400'
																: 'text-sm font-semibold text-emerald-400'
														}
													>
														{item.change}
													</p>
												</div>
											</div>

											<Sparkline
												data={item.data}
												positive={item.positive !== false}
												width={96}
												height={42}
											/>
										</div>
									</div>
								))
							) : (
								<div className='rounded-2xl border border-white/5 bg-white/[0.025] p-4'>
									<p className='text-sm text-slate-400'>
										Market pulse data is loading.
									</p>
								</div>
							)}
						</div>
					</Card>
				</div>
			</section>

			<section className='grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]'>
				<ActionBoard
					items={viewModel?.actionItems ?? []}
					quotesBySymbol={
						new Map(
							(viewModel?.watchlistQuotes ?? []).map((quote) => [
								quote.symbol,
								quote,
							]),
						)
					}
				/>

				<div className='space-y-6'>
					<Card>
						<SectionHeader
							title='Watchlist Radar'
							rightSlot={<span className='text-sm text-slate-500'>Live</span>}
						/>

						<WatchlistRadar quotes={viewModel?.watchlistQuotes ?? []} />
					</Card>
				</div>
			</section>

			<SessionContextStrip
				status={snapshot?.status ?? null}
				refreshedAt={snapshot?.refreshedAt ?? null}
				isStale={isStale}
			/>
			{loadError ? <p className='text-sm text-amber-300'>{loadError}</p> : null}
		</div>
	);
}
