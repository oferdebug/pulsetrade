type TriggerType = 'price';

type TriggerConfig = {
	direction: 'above' | 'below';
	value: number;
};

type AlertDefinition = {
	triggerType: TriggerType;
	triggerConfig: TriggerConfig;
	lastState: 'normal' | 'triggered';
};

type MarketSample = {
	price: number;
	changePercent: number;
	volume: number;
	baselineVolume: number;
};

type EvalResult = {
	shouldFire: boolean;
	nextState: 'normal' | 'triggered';
};

export function evaluateAlert(
	definition: AlertDefinition,
	sample: MarketSample,
): EvalResult {
	if (definition.triggerType !== 'price') {
		return { shouldFire: false, nextState: definition.lastState };
	}

	const { direction, value } = definition.triggerConfig;
	const isSatisfied =
		direction === 'above' ? sample.price > value : sample.price < value;

	if (isSatisfied && definition.lastState !== 'triggered') {
		return { shouldFire: true, nextState: 'triggered' };
	}

	if (!isSatisfied && definition.lastState === 'triggered') {
		return { shouldFire: false, nextState: 'normal' };
	}

	return { shouldFire: false, nextState: definition.lastState };
}
