import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type MarketItem, watchlistData } from '#/data/mockMarkets';

type WatchlistStore = {
	items: MarketItem[];
	addToWatchlist: (item: MarketItem) => void;
	removeFromWatchlist: (symbol: string) => void;
	isInWatchlist: (symbol: string) => boolean;
};

export const useWatchlistStore = create<WatchlistStore>()(
	persist(
		(set, get) => ({
			items: watchlistData,
			addToWatchlist: (item) =>
				set((state) => {
					const exists = state.items.some(
						(watchlistItem) => watchlistItem.symbol === item.symbol,
					);
					if (exists) {
						return state;
					}
					return {
						items: [...state.items, item],
					};
				}),
			removeFromWatchlist: (symbol) =>
				set((state) => ({
					items: state.items.filter((item) => item.symbol !== symbol),
				})),
			isInWatchlist: (symbol) =>
				get().items.some((item) => item.symbol === symbol),
		}),
		{
			name: 'pulsetrade-watchlist',
		},
	),
);
