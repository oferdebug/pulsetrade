import type { AlertDefinition } from './policy';

type MarketSample = {
	price: number;
	changePercent: number;
	volume: number;
	baselineVolume: number;
};

export type EvalResult = {
	shouldFire: boolean;
	nextState: 'normal' | 'triggered';
	reason: 'threshold-cross' | 'reset' | 'no-change';
};

function evaluateTransition(
	isSatisfied: boolean,
	lastState: 'normal' | 'triggered',
): EvalResult {
	if (isSatisfied && lastState !== 'triggered') {
		return {
			shouldFire: true,
			nextState: 'triggered',
			reason: 'threshold-cross',
		};
	}
	if (!isSatisfied && lastState === 'triggered') {
		return {
			shouldFire: false,
			nextState: 'normal',
			reason: 'reset',
		};
	}
	return { shouldFire: false, nextState: lastState, reason: 'no-change' };
}

function isTriggerSatisfied(
	definition: AlertDefinition,
	sample: MarketSample,
): boolean {
	const { direction, value } = definition.triggerConfig;

	switch (definition.triggerType) {
		case 'price': {
			return direction === 'above'
				? sample.price > value
				: sample.price < value;
		}
		case 'percentMove': {
			return direction === 'above'
				? sample.changePercent > value
				: sample.changePercent < value;
		}
		case 'volumeSpike': {
			if (sample.baselineVolume <= 0) {
				return false;
			}
			const ratio = sample.volume / sample.baselineVolume;
			return direction === 'above' ? ratio > value : ratio < value;
		}
		default:
			return false;
	}
}

export function evaluateAlert(
	definition: AlertDefinition,
	sample: MarketSample,
): EvalResult {
	return evaluateTransition(
		isTriggerSatisfied(definition, sample),
		definition.lastState,
	);
}
