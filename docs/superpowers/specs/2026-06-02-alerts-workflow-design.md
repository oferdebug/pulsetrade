# PulseTrade Alerts Workflow Design (v1)

## Scope

This spec defines the v1 alerts system for PulseTrade, including trigger evaluation, delivery routing, user controls, and policy enforcement.

## Goal

Enable users to create high-signal market alerts that notify them through selected channels without spam, while supporting free/pro plan differentiation.

## Non-Goals

- Webhook delivery (deferred to v1.1)
- Digest summaries
- Advanced strategy language (compound conditions, nested logic)
- Broker actions or auto-trading

## Product Decisions Locked

- Delivery includes external channels in v1.
- v1 channels: **Email, Push, SMS**.
- Webhooks are deferred to v1.1.
- Trigger types in v1: **Price threshold**, **Percent move**, **Volume spike**.
- Re-trigger policy: **Fire on false -> true transition, then require reset before next fire**.
- Cadence: user-selectable (`1m`, `5m`, `15m`).
- Multiple channels can be selected per alert.
- Quiet hours included in v1.
- Quiet hours scope: global per user.
- Quiet hours behavior: suppress/drop (no queue/replay).
- SMS is Pro-only.
- Free tier alert cap: 5 active alerts.
- Pro tier alert cap: unlimited (subject to backend fair-use throttling).
- Alert creation entry points: dedicated Alerts page + quick-create from symbol views.

## Architecture

v1 uses a three-stage pipeline:

1. **Rule Evaluation Service**
   - Runs on selected cadence.
   - Loads active alerts, market snapshots, and user policy state.
   - Evaluates trigger conditions for each alert.
   - Detects state transitions needed for reset-based firing.

2. **Alert Event Service**
   - Creates immutable alert events when a trigger transitions from false to true.
   - Stores a compact trigger snapshot for auditing.
   - Produces per-channel delivery intents for dispatcher handling.

3. **Delivery Dispatcher**
   - Applies delivery policies (quiet hours, plan gates, SMS Pro rule, fair-use).
   - Dispatches independently per channel.
   - Records per-channel outcomes (`sent`, `suppressed`, `failed`).

This separation keeps trigger logic and delivery orchestration independent, reducing coupling and making later additions (webhooks, digests, retries policy tuning) straightforward.

## Data Model

### `alerts`

- `id`
- `userId`
- `symbol`
- `triggerType` (`price` | `percentMove` | `volumeSpike`)
- `triggerConfig` (JSON, typed by trigger type)
- `cadence` (`1m` | `5m` | `15m`)
- `channels` (`email`, `push`, `sms`) as a multi-select set
- `isActive`
- `lastState` (normalized evaluator state for reset detection)
- `lastEvaluationAt`
- `lastTriggeredAt`
- `createdAt`, `updatedAt`

### `alert_events` (immutable)

- `id`
- `alertId`
- `userId`
- `symbol`
- `triggerType`
- `triggerSnapshot` (JSON of evaluated market values at trigger time)
- `triggeredAt`
- `status` (`created`, `dispatched`, `suppressed`, `failed`)

### `alert_deliveries`

- `id`
- `eventId`
- `channel` (`email` | `push` | `sms`)
- `attemptedAt`
- `outcome` (`sent`, `suppressed`, `failed`)
- `reason` (e.g. `quiet_hours`, `sms_pro_required`, `provider_error`, `throttled`)

### `user_alert_prefs`

- `userId`
- `quietHoursEnabled`
- `quietStart`
- `quietEnd`
- `timezone`
- optional channel defaults for new alerts
- `updatedAt`

## Trigger Semantics

### Price Threshold

- Supports `above` and `below` conditions.
- Fires when crossing into satisfied state.
- Must return to unsatisfied state before re-firing.

### Percent Move

- Supports absolute or directional percentage threshold.
- Evaluated against latest quote move metric.
- Same reset requirement before re-fire.

### Volume Spike

- Evaluated as current volume vs baseline multiplier.
- Fires when multiplier threshold is first exceeded.
- Requires falling below threshold before re-fire.

## Policies and Entitlements

### Free vs Pro

- Free users can have at most 5 active alerts.
- Pro users can create unlimited alerts.
- Pro still subject to backend fair-use throttling on dispatch volume.

### SMS Restriction

- SMS option appears only for Pro users in effective channel selection.
- If entitlement is lost, SMS channel becomes unavailable for future deliveries and is shown with upgrade messaging in UI.

### Quiet Hours

- Quiet hours are global per user.
- During quiet window, matching events are suppressed/dropped.
- Suppressed events are logged in `alert_deliveries` with `outcome=suppressed`.

## UX Design

### Create/Edit Surfaces

- Dedicated Alerts page for full management.
- Quick-create action available from symbol-centric views (dashboard/markets).
- Both surfaces use the same validation and policy rules.

### Required Controls

- Symbol selection
- Trigger type and trigger config
- Cadence (`1m`, `5m`, `15m`)
- Multi-channel selection (email/push/sms), with SMS availability based on plan
- Active/inactive toggle

### Alert List Experience

- List active/inactive alerts with summary chip set (symbol, trigger, cadence, channels).
- Show last triggered timestamp and recent status.
- Show cap usage for free users (e.g. `3/5 active alerts`).

## Reliability and Error Handling

- Channel dispatch is isolated; one channel failure must not block other channels.
- Provider failures are captured as `failed` outcomes with reason.
- Retries are limited to transient delivery errors and bounded by simple retry policy.
- Evaluation job should be idempotent across a single cadence window.

## Testing Strategy (v1 minimum)

### Unit

- Trigger evaluators for all three trigger types.
- Reset/re-fire transition logic.
- Quiet hours suppression logic.
- Free/pro cap and SMS entitlement enforcement.

### Integration

- End-to-end path: alert definition -> event creation -> per-channel delivery records.
- Multi-channel dispatch with mixed outcomes.
- Quick-create and Alerts page produce equivalent alert records.

### Regression

- No duplicate firing while condition remains true.
- No queued replay after quiet hours end.
- Free cap enforcement at exactly boundary (5 -> reject 6th active).

## Risks and Mitigations

- **High alert volume burst:** apply fair-use throttles and bounded retries.
- **Noisy trigger definitions:** enforce sensible validation ranges in trigger configs.
- **Channel provider outages:** isolate failures per channel and persist outcomes for user transparency.
- **Timezone confusion in quiet hours:** require explicit timezone and preview next quiet window in UI.

## Success Criteria

- Users can create and manage alerts across three trigger types with selectable cadence and channels.
- Triggering follows reset-based behavior without spam loops.
- Quiet hours, free/pro caps, and SMS Pro-only rules are consistently enforced.
- Delivery outcomes are auditable per event and channel.
- v1 scope ships without webhook complexity.
