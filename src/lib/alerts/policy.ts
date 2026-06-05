export type Plan = 'free' | 'pro';
export type AlertChannel = 'email' | 'push' | 'sms';
export type AlertState = 'normal' | 'triggered';
export type AlertTriggerType = 'price' | 'percentMove' | 'volumeSpike';
export type AlertTriggerConfig = {
	direction: 'above' | 'below';
	value: number;
};
export type AlertDefinition = {
	triggerType: AlertTriggerType;
	triggerConfig: AlertTriggerConfig;
	lastState: AlertState;
};

export function canCreateAlert(input: {
	plan: Plan;
	activeAlerts: number;
}): { allowed: true } | { allowed: false; reason: 'free_cap_reached' } {
	if (input.plan === 'free' && input.activeAlerts >= 5) {
		return { allowed: false, reason: 'free_cap_reached' };
	}
	return { allowed: true };
}
export function canUseChannel(
	user: { plan: Plan },
	channel: AlertChannel,
): boolean {
	if (channel === 'sms') {
		return user.plan === 'pro';
	}
	return true;
}

function parseTimeToMinutes(value: string): number {
	const [h, m] = value.split(':').map(Number);
	return h * 60 + m;
}

export function shouldSuppressForQuietHours(input: {
	quietHoursEnabled: boolean;
	quietStart?: string | null;
	quietEnd?: string | null;
	nowMinutes: number;
}): boolean {
	if (!input.quietHoursEnabled || !input.quietStart || !input.quietEnd) {
		return false;
	}

	const start = parseTimeToMinutes(input.quietStart);
	const end = parseTimeToMinutes(input.quietEnd);
	const now = input.nowMinutes;

	// Overnight window (e.g., 22:00 -> 07:00)
	if (start > end) {
		return now >= start || now < end;
	}

	// Same-day window (e.g., 13:00 -> 16:00)
	return now >= start && now < end;
}
