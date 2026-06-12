import { create } from 'zustand';
import type { MarketStatus } from '#/lib/market/types';

type DashboardSessionState = {
	status: MarketStatus | null;
	refreshedAt: number | null;
	setSessionSnapshot: (
		status: MarketStatus | null,
		refreshedAt: number | null,
	) => void;
	clearSessionSnapshot: () => void;
};

export const useDashboardSessionStore = create<DashboardSessionState>(
	(set) => ({
		status: null,
		refreshedAt: null,
		setSessionSnapshot: (status, refreshedAt) => set({ status, refreshedAt }),
		clearSessionSnapshot: () => set({ status: null, refreshedAt: null }),
	}),
);

export function getSessionBadge(status: MarketStatus | null): {
	label: string;
	className: string;
} {
	if (!status) {
		return {
			label: 'Session unavailable',
			className: 'bg-slate-500/10 text-slate-300',
		};
	}

	switch (status.session) {
		case 'open':
			return {
				label: 'Market Open',
				className: 'bg-emerald-500/10 text-emerald-400',
			};
		case 'pre':
			return {
				label: 'Pre-market',
				className: 'bg-amber-500/10 text-amber-300',
			};
		case 'after':
			return {
				label: 'After-hours',
				className: 'bg-blue-500/10 text-blue-300',
			};
		default:
			return {
				label: 'Market Closed',
				className: 'bg-slate-500/10 text-slate-300',
			};
	}
}
