import { getMarketProvider } from '#/lib/market';
import { createStubDeliveryAdapters } from './delivery/stubs';
import { dispatchAlertEvent } from './dispatcher';
import { evaluateAlert } from './evaluator';
import type { AlertDefinition, Plan } from './policy';
import { shouldSuppressForQuietHours } from './policy';
import {
	createAlertDeliveryRow,
	createAlertEventRow,
	getUserAlertPrefs,
	listActiveAlertsByCadence,
	updateAlertEvaluationState,
} from './repository';

type cadence = '1m' | '5m' | '15m';

type CycleSummary = {
	evaluated: number;
	fired: number;
	errors: number;
};

function quoteToSample(quote: { price: number; changePercent: number }) {
	return {
		price: quote.price,
		changePercent: quote.changePercent,
		volume: 0,
		baselineVolume: 1,
	};
}

function getNowMinutesInTimezone(timezone: string): number {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: timezone,
		hour: '2-digit',
		minute: '2-digit',
	}).formatToParts(new Date());

	const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
	const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
	return hour * 60 + minute;
}
