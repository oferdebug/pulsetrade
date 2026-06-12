import type { Quote } from '#/lib/market/types';

export type ActionItemReason =
	| 'Top momentum'
	| 'Drawdown risk'
	| 'Volatility candidate';

export interface ActionItem {
	symbol: string;
	reason: ActionItemReason;
	score: number;
}

export function buildActionBoard(quotes: Quote[]): ActionItem[] {
	if (quotes.length === 0) {
		return [];
	}

	const topMomentum = quotes.reduce((currentBest, quote) =>
		quote.changePercent > currentBest.changePercent ? quote : currentBest,
	);

	const drawdownRisk = quotes.reduce((currentWorst, quote) =>
		quote.changePercent < currentWorst.changePercent ? quote : currentWorst,
	);

	const volatilityCandidate = quotes.reduce((currentMostVolatile, quote) =>
		Math.abs(quote.changePercent) > Math.abs(currentMostVolatile.changePercent)
			? quote
			: currentMostVolatile,
	);

	return [
		{
			symbol: topMomentum.symbol,
			reason: 'Top momentum',
			score: topMomentum.changePercent,
		},
		{
			symbol: drawdownRisk.symbol,
			reason: 'Drawdown risk',
			score: Math.abs(drawdownRisk.changePercent),
		},
		{
			symbol: volatilityCandidate.symbol,
			reason: 'Volatility candidate',
			score: Math.abs(volatilityCandidate.changePercent),
		},
	];
}
