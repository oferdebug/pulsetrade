import { canUseChannel } from './policy';

type Channel = 'email' | 'push' | 'sms';
type Plan = 'free' | 'pro';

type DispatchInput = {
	channels: Channel[];
	plan: Plan;
	quietHours: boolean;
};

type Adapters = {
	email: () => Promise<unknown>;
	push: () => Promise<unknown>;
	sms: () => Promise<unknown>;
};

type DispatchResult = {
	byChannel: Record<Channel, 'sent' | 'failed' | 'suppressed'>;
};

export async function dispatchAlertEvent(
	input: DispatchInput,
	adapters: Adapters,
): Promise<DispatchResult> {
	const byChannel: DispatchResult['byChannel'] = {
		email: 'suppressed',
		push: 'suppressed',
		sms: 'suppressed',
	};

	for (const channel of input.channels) {
		if (input.quietHours) {
			byChannel[channel] = 'suppressed';
			continue;
		}

		if (!canUseChannel({ plan: input.plan }, channel)) {
			byChannel[channel] = 'suppressed';
			continue;
		}

		try {
			await adapters[channel]();
			byChannel[channel] = 'sent';
		} catch {
			byChannel[channel] = 'failed';
		}
	}

	return { byChannel };
}
