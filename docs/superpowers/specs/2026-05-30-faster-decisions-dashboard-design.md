# PulseTrade Faster Decisions Dashboard Design

## Scope

This design covers the first sub-project in the broader roadmap: improving decision speed on the dashboard. It focuses on data clarity, action ranking, watchlist scan speed, and trust signals. It does not include paper trading execution or broker integration.

## Goal

Enable a user to identify one to two actionable symbols in under 10 seconds after opening the dashboard.

## Non-Goals

- Real order execution
- Alerts workflow implementation
- Deep portfolio analytics (attribution/risk decomposition)
- Full retention loop features

## Current State Summary

- Dashboard UI is strong visually but uses mock market data.
- Market provider layer is scaffolded and partially implemented.
- Server functions exist for quotes/OHLCV/search/status but provider methods are still incomplete.
- Market session status in topbar is static.

## Product Design

### 1) Market Pulse (Top Strip)

Show four compact cards:

- SPY daily move
- QQQ daily move
- VIX level + change
- Market breadth (advancers/decliners, with fallback when unavailable)

Behavior:

- Auto-refresh every 30s when market is open
- Lower refresh cadence when closed
- Subtle flash on value updates (green up, red down)

### 2) Action Board (Center)

A ranked list of "what to check now" with one-click navigation to symbol chart.

Initial ranking reasons:

- Top momentum from watchlist
- Biggest drawdown risk from watchlist
- Volume anomaly candidate (simple heuristic)
- Approaching key level candidate (optional fallback if no strong signal)

Each row includes:

- Symbol
- Reason text
- Price and % change
- Action: Open chart

### 3) Watchlist Radar (Right Panel)

Compact live watchlist:

- Symbol, price, % change, micro-sparkline
- Sort presets: movers up, movers down, most volatile
- Quick action to open symbol details

### 4) Session Context (Bottom Strip / Status Row)

- Session badge: pre/open/after/closed
- Last refresh timestamp
- Data health indicator (fresh/stale/error)
- Density toggle placeholder (comfortable/compact) for future rollout

## Technical Design

### Architecture

Keep existing split:

- Market provider abstraction in `src/lib/market/*`
- Server-only access through server functions in `src/lib/market/server.ts`
- Dashboard route consumes server functions and computes local ranking view models

## Data Flow

1. Dashboard requests:
   - `getQuotes(["SPY","QQQ","VIX",...watchlistSymbols])`
   - `getMarketStatus()`
2. Client computes:
   - action board ranking
   - watchlist sort views
3. UI renders modules independently (partial failure tolerant)

## Caching and Refresh

- Server quote cache TTL: 30s (already introduced)
- Client refresh:
  - open session: 30s
  - closed session: 120-300s
- On provider failure:
  - serve last good cache when available
  - render stale state indicator

## Error Handling

- Module-level failure isolation: one failing panel must not blank dashboard.
- Missing watchlist symbols:
  - show empty-state CTA to build watchlist.
- Provider outage:
  - show stale data badge + toast.

## Testing Strategy (Minimum)

Unit tests:

- action board ranking logic
- session-to-label mapping (`pre/open/after/closed`)

Integration/smoke:

- dashboard renders with mocked quote payload
- stale-state rendering path on provider failure

## Delivery Plan

### Ticket 1: Provider completion

- Implement `searchSymbols` and `getMarketStatus` in Finnhub provider.
- Add robust no-data fallbacks.

Acceptance:

- server functions return valid payloads for all five methods.

### Ticket 2: Live pulse + radar wiring

- Replace top pulse and watchlist preview mocks with server-driven data.
- Add refresh cadence logic by market session.

Acceptance:

- Dashboard displays live values and updates over time.

### Ticket 3: Action board

- Add ranking module and action board component.
- Link each row to symbol detail route.

Acceptance:

- At least three ranked opportunities appear when watchlist has data.

### Ticket 4: Session and trust strip

- Wire real session status.
- Add last updated and data health states.

Acceptance:

- User can see if data is fresh or stale at a glance.

### Ticket 5: Tests and polish

- Add baseline tests and responsive polish.

Acceptance:

- `pnpm test`, `pnpm check`, `pnpm lint` all pass.

## Risks and Mitigations

- Provider rate limits:
  - mitigate with cache TTL and limited symbol set per request.
- Inconsistent market breadth availability:
  - provide fallback display and hide unsupported metric gracefully.
- UI overload:
  - enforce compact hierarchy and keep labels concise.

## Success Criteria

- User identifies top actionable symbols in under 10 seconds.
- Dashboard stays functional under partial API failures.
- Data freshness and market session are visible and trustworthy.
