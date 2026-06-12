# Faster Decisions Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a live, decision-oriented dashboard that helps users identify 1-2 actionable symbols in under 10 seconds.

**Architecture:** Keep provider logic in `src/lib/market/`, expose server-only market access via `createServerFn`, and compute dashboard decision ranking in a pure client-safe module. UI modules render independently so partial API failures degrade gracefully.

**Tech Stack:** TanStack Start, TanStack Router, React, zod, Finnhub API, Vitest, Testing Library, Biome.

---

## File Structure

- Create: `src/lib/market/providers/finnhub.search-status.ts` (optional helper extraction if `finnhub.ts` gets too large)
- Modify: `src/lib/market/providers/finnhub.ts`
- Modify: `src/lib/market/server.ts`
- Create: `src/lib/dashboard/action-board.ts`
- Create: `src/lib/dashboard/session.ts`
- Modify: `src/routes/index.tsx`
- Modify: `src/components/layout/AppTopbar.tsx`
- Create: `src/components/dashboard/ActionBoard.tsx`
- Create: `src/components/dashboard/WatchlistRadar.tsx`
- Create: `src/components/dashboard/SessionContextStrip.tsx`
- Create: `src/lib/market/providers/finnhub.test.ts`
- Create: `src/lib/dashboard/action-board.test.ts`
- Create: `src/routes/index.test.tsx`

---

### Task 1: Complete Finnhub Provider (Search + Market Status)

**Files:**
- Modify: `src/lib/market/providers/finnhub.ts`
- Test: `src/lib/market/providers/finnhub.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it, vi } from 'vitest';
import { FinnhubProvider } from './finnhub';

describe('FinnhubProvider', () => {
  it('searchSymbols maps finnhub search payload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: [{ symbol: 'AAPL', description: 'Apple Inc.' }],
      }),
    }));
    const provider = new FinnhubProvider('k');
    const rows = await provider.searchSymbols('aap');
    expect(rows[0]).toEqual({ symbol: 'AAPL', name: 'Apple Inc.', assetClass: 'stock' });
  });

  it('getMarketStatus maps market open payload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ isOpen: true, session: 'regular' }),
    }));
    const provider = new FinnhubProvider('k');
    const status = await provider.getMarketStatus();
    expect(status.isOpen).toBe(true);
    expect(status.session).toBe('open');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/lib/market/providers/finnhub.test.ts`  
Expected: FAIL with `Not implemented` for `searchSymbols` / `getMarketStatus`.

- [ ] **Step 3: Write minimal implementation**

```ts
async searchSymbols(query: string): Promise<SymbolSearchResult[]> {
  const res = await fetch(
    `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${this.apiKey}`,
  );
  if (!res.ok) throw new Error(`Finnhub search failed: ${res.status}`);
  const raw = await res.json();
  return (raw.result ?? []).map((r: { symbol: string; description: string }) => ({
    symbol: r.symbol,
    name: r.description,
    assetClass: 'stock',
  }));
}

async getMarketStatus(): Promise<MarketStatus> {
  const res = await fetch(
    `https://finnhub.io/api/v1/stock/market-status?exchange=US&token=${this.apiKey}`,
  );
  if (!res.ok) throw new Error(`Finnhub market status failed: ${res.status}`);
  const raw = await res.json();
  return {
    session: raw.isOpen ? 'open' : 'closed',
    isOpen: Boolean(raw.isOpen),
    asOf: Date.now(),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/lib/market/providers/finnhub.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/market/providers/finnhub.ts src/lib/market/providers/finnhub.test.ts
git commit -m "feat: implement finnhub search and market status adapters"
```

---

### Task 2: Server Functions for Dashboard Read Model

**Files:**
- Modify: `src/lib/market/server.ts`
- Test: `src/routes/index.test.tsx` (consume shape test)

- [ ] **Step 1: Write failing test for dashboard data shape**

```ts
it('dashboard can load pulse quote set and status', async () => {
  // mock getQuotes/getMarketStatus in route consumption test
  // assert pulse keys exist: SPY, QQQ, VIX and status/session fields
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/routes/index.test.tsx`  
Expected: FAIL due to missing combined load helper.

- [ ] **Step 3: Add minimal read-model helper to server layer**

```ts
export const getDashboardSnapshot = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) =>
    z.object({ symbols: z.array(z.string()).min(1).max(50) }).parse(data),
  )
  .handler(async ({ data }) => {
    const [quotes, status] = await Promise.all([
      Promise.all(data.symbols.map((s) => loadQuote(s.toUpperCase()))),
      getMarketProvider().getMarketStatus(),
    ]);
    return { quotes, status, refreshedAt: Date.now() };
  });
```

- [ ] **Step 4: Run tests**

Run: `pnpm test -- src/routes/index.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/market/server.ts src/routes/index.test.tsx
git commit -m "feat: add dashboard snapshot server function"
```

---

### Task 3: Build Action Board Ranking Engine (Pure Logic)

**Files:**
- Create: `src/lib/dashboard/action-board.ts`
- Test: `src/lib/dashboard/action-board.test.ts`

- [ ] **Step 1: Write failing tests for ranking**

```ts
import { describe, expect, it } from 'vitest';
import { buildActionBoard } from './action-board';

it('ranks top momentum and drawdown from quote set', () => {
  const rows = buildActionBoard([
    { symbol: 'AAPL', changePercent: 3.2, price: 100, change: 3.2, name: 'Apple', currency: 'USD', asOf: 1 },
    { symbol: 'TSLA', changePercent: -4.9, price: 90, change: -4.9, name: 'Tesla', currency: 'USD', asOf: 1 },
  ]);
  expect(rows.some((r) => r.reason === 'Top momentum')).toBe(true);
  expect(rows.some((r) => r.reason === 'Drawdown risk')).toBe(true);
});
```

- [ ] **Step 2: Run tests to confirm fail**

Run: `pnpm test -- src/lib/dashboard/action-board.test.ts`  
Expected: FAIL missing module/function.

- [ ] **Step 3: Implement minimal ranking logic**

```ts
export type ActionItem = {
  symbol: string;
  reason: 'Top momentum' | 'Drawdown risk' | 'Volatility candidate';
  score: number;
};

export function buildActionBoard(quotes: Quote[]): ActionItem[] {
  if (!quotes.length) return [];
  const sorted = [...quotes].sort((a, b) => b.changePercent - a.changePercent);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const byAbs = [...quotes].sort(
    (a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent),
  );
  return [
    { symbol: best.symbol, reason: 'Top momentum', score: best.changePercent },
    { symbol: worst.symbol, reason: 'Drawdown risk', score: Math.abs(worst.changePercent) },
    { symbol: byAbs[0].symbol, reason: 'Volatility candidate', score: Math.abs(byAbs[0].changePercent) },
  ];
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm test -- src/lib/dashboard/action-board.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/dashboard/action-board.ts src/lib/dashboard/action-board.test.ts
git commit -m "feat: add action board ranking engine"
```

---

### Task 4: Integrate Dashboard with Live Snapshot and New Components

**Files:**
- Create: `src/components/dashboard/ActionBoard.tsx`
- Create: `src/components/dashboard/WatchlistRadar.tsx`
- Create: `src/components/dashboard/SessionContextStrip.tsx`
- Modify: `src/routes/index.tsx`
- Modify: `src/components/layout/AppTopbar.tsx`
- Test: `src/routes/index.test.tsx`

- [ ] **Step 1: Write failing integration test**

```ts
it('renders market pulse and action board with live snapshot data', async () => {
  // mock snapshot function return with SPY/QQQ/VIX + watchlist quotes
  // assert action board headings and symbol rows render
});
```

- [ ] **Step 2: Run test and confirm fail**

Run: `pnpm test -- src/routes/index.test.tsx`  
Expected: FAIL for missing components/data wiring.

- [ ] **Step 3: Add minimal UI components and wire data in route**

```tsx
// index.tsx pattern (simplified)
const snapshot = await getDashboardSnapshot({ data: { symbols } });
const actions = buildActionBoard(snapshot.quotes);

<ActionBoard items={actions} />
<WatchlistRadar quotes={watchlistQuotes} />
<SessionContextStrip status={snapshot.status} refreshedAt={snapshot.refreshedAt} />
```

- [ ] **Step 4: Re-run tests**

Run: `pnpm test -- src/routes/index.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/routes/index.tsx src/components/dashboard/ActionBoard.tsx src/components/dashboard/WatchlistRadar.tsx src/components/dashboard/SessionContextStrip.tsx src/components/layout/AppTopbar.tsx src/routes/index.test.tsx
git commit -m "feat: wire live dashboard pulse action board and session context"
```

---

### Task 5: Resilience, Stale State, and Final Validation

**Files:**
- Modify: `src/lib/market/server.ts`
- Modify: `src/components/dashboard/SessionContextStrip.tsx`
- Test: `src/routes/index.test.tsx`

- [ ] **Step 1: Add failing test for stale-state behavior**

```ts
it('shows stale indicator when provider call fails but cached quote exists', async () => {
  // force provider error after cache primed
  // assert stale badge is shown
});
```

- [ ] **Step 2: Run test to confirm fail**

Run: `pnpm test -- src/routes/index.test.tsx`  
Expected: FAIL: no stale state in response/UI.

- [ ] **Step 3: Implement stale metadata path**

```ts
// server.ts
type QuoteEnvelope = { quote: Quote; stale: boolean };
// loadQuote returns stale=true when falling back to cached value after provider error
```

```tsx
// SessionContextStrip
{isStale ? <span>Data stale</span> : <span>Live</span>}
```

- [ ] **Step 4: Run full project verification**

Run:
- `pnpm test`
- `pnpm check`
- `pnpm lint`

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/market/server.ts src/components/dashboard/SessionContextStrip.tsx src/routes/index.test.tsx
git commit -m "feat: add stale-state handling and dashboard resilience signals"
```

---

## Final Verification Checklist

- [ ] Dashboard loads with live quote payload (no mock source dependency for pulse/radar)
- [ ] Action Board lists at least 3 ranked rows when watchlist has quotes
- [ ] Session context reflects live provider status
- [ ] Stale state appears on provider error fallback
- [ ] `pnpm test`, `pnpm check`, `pnpm lint` pass

## Notes

- Keep this plan scoped to faster decisions only.
- Do not add paper trading, alerts engine, or broker flows in this cycle.
- If Finnhub breadth or VIX signal is unavailable, keep module visible with fallback text instead of removing layout sections.
