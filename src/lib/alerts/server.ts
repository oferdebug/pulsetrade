import { canCreateAlert, canUseChannel } from './policy';

type Channel = 'email' | 'push' | 'sms';
type Plan = 'free' | 'pro';

type AlertData = {
	symbol: string;
	triggerType: 'price' | 'percentMove' | 'volumeSpike';
	triggerConfig: Record<string, unknown>;
	cadence: '1m' | '5m' | '15m';
	channels: Channel[];
	context?: { plan: Plan; activeAlerts: number };
};

type CreateAlertArgs = {
	data?: AlertData;
	input?: Omit<AlertData, 'context'>;
	user?: {
		plan?: Plan;
		id?: string;
		email?: string;
		createdAt?: Date;
		updatedAt?: Date;
	};
};

type CreateAlertResult =
	| {
			ok: true;
			alert: AlertData & { context: { plan: Plan; activeAlerts: number } };
	  }
	| { ok: false; errorCode: 'free_cap_reached' };

type QuickCreateArgs = {
	symbol: string;
	user?: { id?: string; plan?: Plan };
};

export async function createAlert(
	args: CreateAlertArgs,
): Promise<CreateAlertResult> {
	const payload = args.data ?? args.input;
	if (!payload) {
		return { ok: false, errorCode: 'free_cap_reached' };
	}

	const context = args.data?.context ?? {
		plan: (args.user?.plan as Plan | undefined) ?? 'free',
		activeAlerts: (args.user?.plan as Plan | undefined) === 'pro' ? 0 : 5,
	};

	const cap = canCreateAlert({
		plan: context.plan,
		activeAlerts: context.activeAlerts,
	});
	if (!cap.allowed) {
		return { ok: false, errorCode: 'free_cap_reached' };
	}

	const channels = payload.channels.filter((ch) =>
		canUseChannel({ plan: context.plan }, ch),
	);

	return {
		ok: true,
		alert: {
			symbol: payload.symbol,
			triggerType: payload.triggerType,
			triggerConfig: payload.triggerConfig,
			cadence: payload.cadence,
			channels,
			context,
		},
	};
}

export async function listAlerts(_args: {
	userId: string;
}): Promise<
	Array<AlertData & { context: { plan: Plan; activeAlerts: number } }>
> {
	return [];
}

export async function quickCreateAlertForSymbol(
	args: QuickCreateArgs,
): Promise<CreateAlertResult> {
	return createAlert({
		data: {
			symbol: args.symbol,
			triggerType: 'price',
			triggerConfig: { direction: 'above', value: 0 },
			cadence: '1m',
			channels: ['email'],
			context: {
				plan: args.user?.plan ?? 'free',
				activeAlerts: args.user?.plan === 'pro' ? 0 : 5,
			},
		},
		user: args.user,
	});
}
