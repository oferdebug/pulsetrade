# Alerts Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build v1 alerts with price/percent/volume triggers, multi-channel delivery (email/push/SMS), quiet hours suppression, and free/pro entitlements.

**Architecture:** Implement a three-stage pipeline: evaluator -> alert event creation -> per-channel dispatcher. Keep trigger logic pure and testable, keep DB and delivery concerns in separate modules, and expose UI-safe server functions for create/list/toggle and quick-create flows.

**Tech Stack:** TanStack Start, React, TypeScript, Drizzle ORM/Postgres, Zod, Vitest, Biome.

---

## File Structure

- Modify: `src/db/schema.ts` (alerts + events + deliveries + prefs tables)
- Create: `drizzle/0003_alerts_workflow.sql` (schema migration)
- Create: `src/lib/alerts/types.ts` (domain types and unions)
- Create: `src/lib/alerts/evaluator.ts` (pure trigger + reset logic)
- Create: `src/lib/alerts/policy.ts` (free/pro caps, SMS entitlement, quiet hours)
- Create: `src/lib/alerts/repository.ts` (DB reads/writes for alerts/events/deliveries)
- Create: `src/lib/alerts/delivery/email.ts` (email adapter interface + implementation stub)
- Create: `src/lib/alerts/delivery/push.ts` (push adapter interface + implementation stub)
- Create: `src/lib/alerts/delivery/sms.ts` (sms adapter interface + implementation stub)
- Create: `src/lib/alerts/dispatcher.ts` (policy-aware per-channel dispatch orchestration)
- Create: `src/lib/alerts/runner.ts` (scheduled evaluation runner by cadence)
- Create: `src/lib/alerts/server.ts` (create/list/update/toggle/quick-create server fns)
- Create: `src/components/alerts/AlertForm.tsx` (shared create/edit form)
- Create: `src/components/alerts/AlertsList.tsx` (list + state/action UI)
- Create: `src/routes/alerts/index.tsx` (alerts management page)
- Modify: `src/routes/markets/$symbol.tsx` (quick-create entry)
- Modify: `src/routes/index.tsx` (optional quick-create CTA in dashboard symbol surfaces)
- Create: `src/lib/alerts/evaluator.test.ts`
- Create: `src/lib/alerts/policy.test.ts`
- Create: `src/lib/alerts/dispatcher.test.ts`
- Create: `src/lib/alerts/server.test.ts`
- Modify: `.env.example` (channel provider env vars)

---

### Task 1: Add Alerts Database Schema

**Files:**
- Modify: `src/db/schema.ts`
- Create: `drizzle/0003_alerts_workflow.sql`

- [ ] **Step 1: Write failing schema expectations test**

```ts
// src/lib/alerts/server.test.ts
import { describe, expect, it } from 'vitest';
import { alerts, alertEvents, alertDeliveries, userAlertPrefs } from '#/db/schema';

describe('alerts schema', () => {
  it('exports required alerts tables', () => {
    expect(alerts).toBeDefined();
    expect(alertEvents).toBeDefined();
    expect(alertDeliveries).toBeDefined();
    expect(userAlertPrefs).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/lib/alerts/server.test.ts`  
Expected: FAIL with missing exports from `src/db/schema.ts`.

- [ ] **Step 3: Add schema tables and indexes**

```ts
// src/db/schema.ts (snippet)
export const alerts = pgTable('alerts', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  symbol: text('symbol').notNull(),
  triggerType: text('triggerType').notNull(), // price | percentMove | volumeSpike
  triggerConfig: text('triggerConfig').notNull(), // JSON string
  cadence: text('cadence').notNull(), // 1m | 5m | 15m
  channels: text('channels').notNull(), // JSON string array
  isActive: boolean('isActive').default(true).notNull(),
  lastState: text('lastState').default('normal').notNull(),
  lastEvaluationAt: timestamp('lastEvaluationAt'),
  lastTriggeredAt: timestamp('lastTriggeredAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()).notNull(),
});
```

```sql
-- drizzle/0003_alerts_workflow.sql (snippet)
CREATE TABLE "alerts" (...);
CREATE INDEX "alerts_userId_idx" ON "alerts" ("userId");
CREATE INDEX "alerts_userId_cadence_idx" ON "alerts" ("userId", "cadence");
CREATE TABLE "alert_events" (...);
CREATE TABLE "alert_deliveries" (...);
CREATE TABLE "user_alert_prefs" (...);
```

- [ ] **Step 4: Run schema test**

Run: `pnpm test -- src/lib/alerts/server.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/db/schema.ts drizzle/0003_alerts_workflow.sql src/lib/alerts/server.test.ts
git commit -m "feat: add alerts workflow database schema"
```

---

### Task 2: Build Pure Evaluator + Reset Semantics

**Files:**
- Create: `src/lib/alerts/types.ts`
- Create: `src/lib/alerts/evaluator.ts`
- Create: `src/lib/alerts/evaluator.test.ts`

- [ ] **Step 1: Write failing evaluator tests**

```ts
import { describe, expect, it } from 'vitest';
import { evaluateAlert } from './evaluator';

it('fires only on false->true transition for price-above', () => {
  const first = evaluateAlert(
    { triggerType: 'price', triggerConfig: { direction: 'above', value: 100 }, lastState: 'normal' },
    { price: 101, changePercent: 0, volume: 10_000, baselineVolume: 8_000 },
  );
  expect(first.shouldFire).toBe(true);
  expect(first.nextState).toBe('triggered');

  const second = evaluateAlert(
    { triggerType: 'price', triggerConfig: { direction: 'above', value: 100 }, lastState: 'triggered' },
    { price: 105, changePercent: 0, volume: 10_000, baselineVolume: 8_000 },
  );
  expect(second.shouldFire).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/lib/alerts/evaluator.test.ts`  
Expected: FAIL due to missing evaluator module/function.

- [ ] **Step 3: Implement minimal evaluator**

```ts
// src/lib/alerts/evaluator.ts (snippet)
export function evaluateAlert(def: AlertDefinition, sample: MarketSample): EvalResult {
  const isSatisfied = isConditionSatisfied(def, sample);
  const previouslyTriggered = def.lastState === 'triggered';

  if (isSatisfied && !previouslyTriggered) {
    return { shouldFire: true, nextState: 'triggered', reason: 'threshold-cross' };
  }
  if (!isSatisfied && previouslyTriggered) {
    return { shouldFire: false, nextState: 'normal', reason: 'reset' };
  }
  return { shouldFire: false, nextState: def.lastState, reason: 'no-change' };
}
```

- [ ] **Step 4: Run evaluator tests**

Run: `pnpm test -- src/lib/alerts/evaluator.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/alerts/types.ts src/lib/alerts/evaluator.ts src/lib/alerts/evaluator.test.ts
git commit -m "feat: add pure alerts evaluator with reset semantics"
```

---

### Task 3: Add Policy Enforcement (Entitlements + Quiet Hours)

**Files:**
- Create: `src/lib/alerts/policy.ts`
- Create: `src/lib/alerts/policy.test.ts`

- [ ] **Step 1: Write failing policy tests**

```ts
import { describe, expect, it } from 'vitest';
import { canCreateAlert, canUseChannel, shouldSuppressForQuietHours } from './policy';

it('enforces free cap at five active alerts', () => {
  expect(canCreateAlert({ plan: 'free', activeAlerts: 5 })).toEqual({
    allowed: false,
    reason: 'free_cap_reached',
  });
});

it('disallows sms for free plan', () => {
  expect(canUseChannel({ plan: 'free' }, 'sms')).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/lib/alerts/policy.test.ts`  
Expected: FAIL missing functions.

- [ ] **Step 3: Implement policy helpers**

```ts
export function canCreateAlert(input: { plan: 'free' | 'pro'; activeAlerts: number }) {
  if (input.plan === 'free' && input.activeAlerts >= 5) {
    return { allowed: false as const, reason: 'free_cap_reached' as const };
  }
  return { allowed: true as const };
}

export function canUseChannel(user: { plan: 'free' | 'pro' }, channel: AlertChannel) {
  if (channel === 'sms') return user.plan === 'pro';
  return true;
}
```

- [ ] **Step 4: Run policy tests**

Run: `pnpm test -- src/lib/alerts/policy.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/alerts/policy.ts src/lib/alerts/policy.test.ts
git commit -m "feat: enforce alerts plan and quiet-hours policies"
```

---

### Task 4: Implement Dispatcher and Channel Adapters

**Files:**
- Create: `src/lib/alerts/delivery/email.ts`
- Create: `src/lib/alerts/delivery/push.ts`
- Create: `src/lib/alerts/delivery/sms.ts`
- Create: `src/lib/alerts/dispatcher.ts`
- Create: `src/lib/alerts/dispatcher.test.ts`

- [ ] **Step 1: Write failing dispatcher tests**

```ts
import { describe, expect, it, vi } from 'vitest';
import { dispatchAlertEvent } from './dispatcher';

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/lib/alerts/dispatcher.test.ts`  
Expected: FAIL missing dispatcher implementation.

- [ ] **Step 3: Implement dispatcher + adapter contracts**

```ts
// src/lib/alerts/dispatcher.ts (snippet)
for (const channel of channels) {
  if (!canUseChannel(user, channel)) {
    outcomes[channel] = 'suppressed';
    continue;
  }
  if (quietSuppressed) {
    outcomes[channel] = 'suppressed';
    continue;
  }
  try {
    await adapters[channel](payload);
    outcomes[channel] = 'sent';
  } catch {
    outcomes[channel] = 'failed';
  }
}
```

- [ ] **Step 4: Run dispatcher tests**

Run: `pnpm test -- src/lib/alerts/dispatcher.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/alerts/delivery/email.ts src/lib/alerts/delivery/push.ts src/lib/alerts/delivery/sms.ts src/lib/alerts/dispatcher.ts src/lib/alerts/dispatcher.test.ts
git commit -m "feat: add channel-aware alerts dispatcher"
```

---

### Task 5: Build Repository + Runner + Server Functions

**Files:**
- Create: `src/lib/alerts/repository.ts`
- Create: `src/lib/alerts/runner.ts`
- Create: `src/lib/alerts/server.ts`
- Modify: `src/lib/market/server.ts` (if helper exposure needed)
- Create: `src/lib/alerts/server.test.ts` (extend)

- [ ] **Step 1: Write failing server tests**

```ts
import { describe, expect, it } from 'vitest';
import { createAlert, listAlerts, quickCreateAlertForSymbol } from './server';

it('rejects free user sixth active alert', async () => {
  const result = await createAlert({
    data: { symbol: 'AAPL', triggerType: 'price', triggerConfig: { direction: 'above', value: 200 }, cadence: '1m', channels: ['email'] },
  });
  expect(result.ok).toBe(false);
  expect(result.errorCode).toBe('free_cap_reached');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/lib/alerts/server.test.ts`  
Expected: FAIL missing API methods and policy checks.

- [ ] **Step 3: Implement repository, runner, and server functions**

```ts
// src/lib/alerts/server.ts (snippet)
export const createAlert = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => createAlertSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await requireAuthUser();
    const activeCount = await alertsRepo.countActiveForUser(user.id);
    const cap = canCreateAlert({ plan: user.plan, activeAlerts: activeCount });
    if (!cap.allowed) return { ok: false as const, errorCode: cap.reason };

    const normalizedChannels = data.channels.filter((ch) => canUseChannel(user, ch));
    const alert = await alertsRepo.insertAlert({ ...data, channels: normalizedChannels, userId: user.id });
    return { ok: true as const, alert };
  });
```

- [ ] **Step 4: Run server tests**

Run: `pnpm test -- src/lib/alerts/server.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/alerts/repository.ts src/lib/alerts/runner.ts src/lib/alerts/server.ts src/lib/alerts/server.test.ts src/lib/market/server.ts
git commit -m "feat: implement alerts server APIs and evaluation runner"
```

---

### Task 6: Add Alerts UI + Quick-Create

**Files:**
- Create: `src/components/alerts/AlertForm.tsx`
- Create: `src/components/alerts/AlertsList.tsx`
- Create: `src/routes/alerts/index.tsx`
- Modify: `src/routes/markets/$symbol.tsx`
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Write failing route/component integration test**

```ts
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlertsPage from '#/routes/alerts/index';

it('shows trigger type, cadence, and multi-channel controls', () => {
  render(<AlertsPage />);
  expect(screen.getByText('Create Alert')).toBeTruthy();
  expect(screen.getByLabelText('Trigger Type')).toBeTruthy();
  expect(screen.getByLabelText('Cadence')).toBeTruthy();
  expect(screen.getByLabelText('Email')).toBeTruthy();
  expect(screen.getByLabelText('Push')).toBeTruthy();
  expect(screen.getByLabelText('SMS (Pro)')).toBeTruthy();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/routes/alerts/index.test.tsx`  
Expected: FAIL due to missing route/components.

- [ ] **Step 3: Implement Alerts page and quick-create surfaces**

```tsx
// src/components/alerts/AlertForm.tsx (snippet)
<select aria-label="Trigger Type" value={triggerType} onChange={...}>
  <option value="price">Price Threshold</option>
  <option value="percentMove">Percent Move</option>
  <option value="volumeSpike">Volume Spike</option>
</select>
<select aria-label="Cadence" value={cadence} onChange={...}>
  <option value="1m">1m</option>
  <option value="5m">5m</option>
  <option value="15m">15m</option>
</select>
```

- [ ] **Step 4: Run UI tests**

Run: `pnpm test -- src/routes/alerts/index.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/alerts/AlertForm.tsx src/components/alerts/AlertsList.tsx src/routes/alerts/index.tsx src/routes/markets/$symbol.tsx src/routes/index.tsx src/routes/alerts/index.test.tsx
git commit -m "feat: add alerts management UI and quick-create entry points"
```

---

### Task 7: Env, Final Verification, and Hardening

**Files:**
- Modify: `.env.example`
- Modify: `README.md` (alerts section + env docs)
- Modify: `docs/superpowers/specs/2026-06-02-alerts-workflow-design.md` (if implemented scope notes needed)

- [ ] **Step 1: Add failing config validation test**

```ts
import { describe, expect, it } from 'vitest';
import { validateAlertsEnv } from '#/lib/alerts/delivery/email';

it('requires provider keys for enabled channels', () => {
  expect(() => validateAlertsEnv({ emailEnabled: true, key: '' })).toThrow();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/lib/alerts/delivery/email.test.ts`  
Expected: FAIL missing env validation helper.

- [ ] **Step 3: Implement env validation + docs updates**

```env
# .env.example
ALERTS_EMAIL_PROVIDER=resend
ALERTS_EMAIL_API_KEY=
ALERTS_PUSH_PROVIDER=
ALERTS_PUSH_API_KEY=
ALERTS_SMS_PROVIDER=twilio
ALERTS_SMS_API_KEY=
ALERTS_SMS_FROM=
```

- [ ] **Step 4: Run full verification**

Run:
- `pnpm test`
- `pnpm check`
- `pnpm lint`

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add .env.example README.md docs/superpowers/specs/2026-06-02-alerts-workflow-design.md src/lib/alerts/delivery/email.ts src/lib/alerts/delivery/email.test.ts
git commit -m "chore: finalize alerts env validation and docs"
```

---

## Final Verification Checklist

- [ ] Free users blocked at 5 active alerts
- [ ] Pro users can create >5 alerts
- [ ] SMS selectable only for Pro
- [ ] Quiet hours suppress and drop (no replay)
- [ ] Trigger re-fire occurs only after reset
- [ ] Multi-channel dispatch records per-channel outcomes
- [ ] Alerts page and quick-create produce valid alerts
- [ ] `pnpm test`, `pnpm check`, `pnpm lint` pass

