import { describe, expect, it, vi } from 'vitest';
import { dispatchAlertEvent } from './dispatcher';

describe('dispatchAlertEvent', () => {
	it('dispatches each allowed channel independently', async () => {
		const email = vi.fn().mockResolvedValue({ ok: true });
		const push = vi.fn().mockRejectedValue(new Error('push down'));
		const sms = vi.fn().mockResolvedValue({ ok: true });

		const result = await dispatchAlertEvent(
			{ channels: ['email', 'push', 'sms'], plan: 'pro', quietHours: false },
			{ email, push, sms },
		);

		expect(result.byChannel.email).toBe('sent');
		expect(result.byChannel.push).toBe('failed');
		expect(result.byChannel.sms).toBe('sent');
	});
});
it('suppresses all channels during quiet hours', async () => {
	const email = vi.fn().mockResolvedValue({ ok: true });
	const push = vi.fn().mockResolvedValue({ ok: true });
	const sms = vi.fn().mockResolvedValue({ ok: true });

	const result = await dispatchAlertEvent(
		{ channels: ['email', 'push', 'sms'], plan: 'pro', quietHours: true },
		{ email, push, sms },
	);

	expect(result.byChannel.email).toBe('suppressed');
	expect(result.byChannel.push).toBe('suppressed');
	expect(result.byChannel.sms).toBe('suppressed');

	expect(email).not.toHaveBeenCalled();
	expect(push).not.toHaveBeenCalled();
	expect(sms).not.toHaveBeenCalled();
});
