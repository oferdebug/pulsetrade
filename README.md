# PulseTrade

## Overview
- What PulseTrade is (1-2 lines).
- Who it is for.
- Core value proposition.

## Current Status
- Current stage (prototype / MVP).
- What is real today.
- What is still mock/placeholder.

## Features Available Now
- Authentication (email/password + social).
- Dashboard.
- Markets browser.
- Watchlist.
- Portfolio view.
- Profile/settings pages.

## Planned Features
### Phase 1
- Live market data integration
- Real chart rendering
- Symbol search

### Phase 2
- Persisted watchlist in DB
- Portfolio data model + CRUD
- Profile/settings persistence

### Phase 3
- Paper trading flow
- Mobile navigation polish
- Command palette + notifications

### Phase 4
- Production hardening
- Error handling + observability
- Smoke/E2E validation

## Tech Stack
- Framework:
- Routing:
- UI:
- State:
- Auth:
- Database:
- ORM:
- Deployment:
- Testing:
- Lint/format:

## Prerequisites
- Node version:
- pnpm version:
- PostgreSQL:
- OAuth app credentials (Google/GitHub):

## Environment Variables
| Variable | Required | Description | Example |
|---|---|---|---|
| DATABASE_URL | Yes | PostgreSQL connection string | postgresql://... |
| BETTER_AUTH_SECRET | Yes | Auth signing secret | ... |
| BETTER_AUTH_URL | Yes | App base URL | http://localhost:3000 |
| BETTER_AUTH_TRUSTED_ORIGINS | Optional | Comma-separated trusted origins | http://localhost:3000 |
| GOOGLE_CLIENT_ID | Optional/Required* | Google OAuth | ... |
| GOOGLE_CLIENT_SECRET | Optional/Required* | Google OAuth | ... |
| GITHUB_CLIENT_ID | Optional/Required* | GitHub OAuth | ... |
| GITHUB_CLIENT_SECRET | Optional/Required* | GitHub OAuth | ... |
| MARKET_DATA_API_KEY | Future | Market data provider key | ... |

\* Clarify your chosen local-dev behavior.

## Local Development

### 1) Install dependencies
```bash
pnpm install