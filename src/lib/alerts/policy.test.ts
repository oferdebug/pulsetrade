import { describe, expect, it } from 'vitest';
import {
	canCreateAlert,
	canUseChannel,
	shouldSuppressForQuietHours,
} from './policy';

describe('alerts policy', () => {
	it('enforces free cap at five active alerts', () => {
		expect(canCreateAlert({ plan: 'free', activeAlerts: 5 })).toEqual({
			allowed: false,
			reason: 'free_cap_reached',
		});
	});
	it('suppresses when current time is inside quiet-hours window', () => {
		const suppressed = shouldSuppressForQuietHours({
			quietHoursEnabled: true,
			quietStart: '22:00',
			quietEnd: '07:00',
			nowMinutes: 24 * 60 + 10,
		});
		expect(suppressed).toBe(true);
	});

	it('disallows sms for free plan', () => {
		expect(canUseChannel({ plan: 'free' }, 'sms')).toBe(false);
	});
	it('does not suppress when outside quiet-hours window', () => {
		const suppressed = shouldSuppressForQuietHours({
			quietHoursEnabled: true,
			quietStart: '22:00',
			quietEnd: '07:00',
			nowMinutes: 12 * 60,
		});
		expect(suppressed).toBe(false);
	});
});
