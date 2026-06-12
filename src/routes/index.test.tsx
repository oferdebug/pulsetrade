// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ActionBoard from '#/components/dashboard/ActionBoard';
import SessionContextStrip from '#/components/dashboard/SessionContextStrip';
import WatchlistRadar from '#/components/dashboard/WatchlistRadar';
import type { MarketProvider } from '#/lib/market/provider';
import { buildDashboardSnapshot } from '#/lib/market/server';
import { deriveDashboardView } from './index';

vi.mock('@tanstack/react-router', async () => {
	const actual = await vi.importActual<typeof import('@tanstack/react-router')>(
		'@tanstack/react-router',
	);

	return {
		...actual,
		Link: ({
			children,
			className,
		}: {
			children: ReactNode;
			className?: string;
		}) => (
			<a href='/markets' className={className}>
				{children}
			</a>
		),
	};
});

const getQuote = vi.fn<MarketProvider['getQuote']>();
const getMarketStatus = vi.fn<MarketProvider['getMarketStatus']>();

vi.mock('#/lib/market/index', () => ({
	getMarketProvider: () =>
		({
			getQuote,
			getMarketStatus,
			getQuotes: vi.fn(),
			getOHLCV: vi.fn(),
			searchSymbols: vi.fn(),
		}) satisfies MarketProvider,
}));

describe('dashboard snapshot', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('loads pulse-like quotes and market status in one shape', async () => {
		getQuote.mockImplementation(async (symbol) => ({
			symbol,
			name: `${symbol} Inc`,
			price: 100,
			change: 1.25,
			changePercent: 1.25,
			currency: 'USD',
			asOf: 1_717_000_000_000,
		}));
		getMarketStatus.mockResolvedValue({
			session: 'open',
			isOpen: true,
			asOf: 1_717_000_000_000,
		});

		const snapshot = await buildDashboardSnapshot(['spy', 'qqq', 'vix']);

		expect(getQuote).toHaveBeenCalledTimes(3);
		expect(getQuote).toHaveBeenNthCalledWith(1, 'SPY');
		expect(getQuote).toHaveBeenNthCalledWith(2, 'QQQ');
		expect(getQuote).toHaveBeenNthCalledWith(3, 'VIX');
		expect(getMarketStatus).toHaveBeenCalledTimes(1);

		const pulseSymbols = ['SPY', 'QQQ', 'VIX'] as const;
		for (const symbol of pulseSymbols) {
			const quote = snapshot.quotes.find((row) => row.symbol === symbol);
			expect(quote).toEqual(
				expect.objectContaining({
					symbol,
					name: expect.any(String),
					price: expect.any(Number),
					change: expect.any(Number),
					changePercent: expect.any(Number),
					currency: expect.any(String),
					asOf: expect.any(Number),
				}),
			);
		}

		expect(snapshot).toEqual(
			expect.objectContaining({
				quotes: expect.any(Array),
				status: expect.objectContaining({
					session: 'open',
					isOpen: true,
					asOf: expect.any(Number),
				}),
				refreshedAt: expect.any(Number),
				isStale: false,
			}),
		);
	});

	it('renders market pulse and action board with live snapshot data', async () => {
		getQuote.mockImplementation(async (symbol) => ({
			symbol,
			name: `${symbol} Inc`,
			price: 120,
			change: symbol === 'TSLA' ? -5 : 2.4,
			changePercent: symbol === 'TSLA' ? -4.9 : 2.1,
			currency: 'USD',
			asOf: 1_717_000_000_000,
		}));
		getMarketStatus.mockResolvedValue({
			session: 'open',
			isOpen: true,
			asOf: 1_717_000_000_000,
		});

		const snapshot = await buildDashboardSnapshot([
			'spy',
			'qqq',
			'vix',
			'aapl',
			'tsla',
		]);
		const derived = deriveDashboardView(snapshot);
		const quotesBySymbol = new Map(
			derived.watchlistQuotes.map((quote) => [quote.symbol, quote]),
		);

		render(
			<div>
				<h2>Market Pulse</h2>
				<p>{derived.pulseQuotes.map((quote) => quote.symbol).join(', ')}</p>
				<ActionBoard
					items={derived.actionItems}
					quotesBySymbol={quotesBySymbol}
				/>
				<WatchlistRadar quotes={derived.watchlistQuotes} />
				<SessionContextStrip
					status={snapshot.status}
					refreshedAt={snapshot.refreshedAt}
				/>
			</div>,
		);

		expect(screen.getByText('Market Pulse')).toBeTruthy();
		expect(screen.getByText('Action Board')).toBeTruthy();
		expect(screen.getByText('SPY, QQQ, VIX')).toBeTruthy();
		expect(screen.getAllByText('AAPL').length).toBeGreaterThan(0);
		expect(screen.getAllByText('TSLA').length).toBeGreaterThan(0);
		expect(screen.getAllByText('Open chart').length).toBeGreaterThan(0);
	});

	it('shows stale indicator when provider call fails but cached quote exists', async () => {
		const staleSymbol = 'stle';
		getQuote.mockResolvedValueOnce({
			symbol: staleSymbol.toUpperCase(),
			name: 'Stale Inc',
			price: 50,
			change: 1,
			changePercent: 2,
			currency: 'USD',
			asOf: 1_717_000_000_000,
		});
		getMarketStatus.mockResolvedValue({
			session: 'open',
			isOpen: true,
			asOf: 1_717_000_000_000,
		});

		const first = await buildDashboardSnapshot([staleSymbol]);
		expect(first.isStale).toBe(false);

		getQuote.mockRejectedValueOnce(new Error('provider outage'));
		getMarketStatus.mockResolvedValue({
			session: 'open',
			isOpen: true,
			asOf: 1_717_000_000_001,
		});

		const second = await buildDashboardSnapshot([staleSymbol]);
		expect(second.isStale).toBe(true);
		expect(second.quotes[0]).toEqual(first.quotes[0]);

		render(
			<SessionContextStrip
				status={second.status}
				refreshedAt={second.refreshedAt}
				isStale={second.isStale}
			/>,
		);
		expect(screen.getByText('Data stale')).toBeTruthy();
	});
});
