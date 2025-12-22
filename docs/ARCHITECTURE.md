# Architecture Overview

This document describes the system architecture of the Xandeum pNode Analytics Platform.

## System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   React Pages   │  React Hooks    │     Service Worker          │
│   (Next.js)     │  (TanStack)     │     (Push Notifications)    │
│                 │                 │     Copilot Widget          │
└────────┬────────┴────────┬────────┴──────────────┬──────────────┘
         │                 │                       │
         ▼                 ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS APP ROUTER                          │
├─────────────────────────────────────────────────────────────────┤
│  /                     Dashboard (home page)                    │
│  /analytics            Charts and network analytics             │
│  /map                  Geographic visualization                 │
│  /leaderboard          Top performing nodes                     │
│  /guide                User documentation                       │
│  /nodes/[id]           Individual node details                  │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API ROUTES (/api/*)                         │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  /api/prpc   │ /api/alerts  │ /api/history │   /api/solana     │
│  (pRPC proxy)│ (subscribe)  │ (historical) │   (blockchain)    │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────────┘
       │              │              │                │
       ▼              ▼              ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICES LAYER                               │
├────────────────┬────────────────┬────────────────┬──────────────┤
│  prpcService   │  geoService    │ analyticsService│ notification │
│  (node data)   │  (IP lookup)   │  (calculations) │  Service     │
│                │                │                 │  Copilot RAG │
└────────┬───────┴────────┬───────┴────────────────┴────────┬─────┘
         │                │                                 │
         ▼                ▼                                 ▼
┌────────────────┬────────────────┬─────────────────────────────┐
│ PNODE WATCH PNODES │   GEO APIs     │  EXTERNAL SERVICES          │
│ (Seed Nodes)   │  ip-api.com    │  Brevo (Email)              │
│                │  ipwho.is      │  Web Push (VAPID)           │
│                │                │  Jupiter API (Token Data)   │
└────────────────┴────────────────┴─────────────────────────────┘
```

## Core Components

### Pages (App Router)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `app/page.tsx` | Main dashboard with stats, filters, and node table |
| `/analytics` | `app/analytics/page.tsx` | Charts and network trends |
| `/map` | `app/map/page.tsx` | Interactive world map with node locations |
| `/leaderboard` | `app/leaderboard/page.tsx` | Top nodes by various metrics |
| `/guide` | `app/guide/page.tsx` | User documentation |
| `/calculator` | `app/calculator/page.tsx` | ROI Calculator for pNode operators |
| `/staking` | `app/staking/page.tsx` | XANDSOL Staking Calculator |
| `/nodes/[id]` | `app/nodes/[id]/page.tsx` | Individual node details |

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useNodes` | Fetch and cache pNode data from API |
| `useNetworkStats` | Calculate network-level statistics |
| `useNodeFilters` | Search, filter, and sort node data |
| `useNodeSort` | Sort nodes by various columns |
| `usePagination` | Handle table pagination |
| `useGeoLocation` | Lazy fetch IP geolocation data |
| `useNodeLocations` | Batch geolocation for multiple nodes |
| `useComparison` | Node comparison selection state |
| `useTheme` | Dark/light mode toggle |
| `useHistory` | Fetch historical network data |
| `useNodeStats` | Fetch detailed stats for single node |

### Services

| Service | File | Responsibility |
|---------|------|----------------|
| pRPC Service | `lib/services/prpcService.ts` | Fetch nodes from seed nodes |
| Geo Service | `lib/services/geoService.ts` | IP geolocation with caching |
| Analytics Service | `lib/services/analyticsService.ts` | Calculations, scores, and metrics |
| Notification Service | `lib/services/notificationService.ts` | Email and push notifications |
| Alert Service | `lib/services/alertService.ts` | Alert subscription management |
| Mock Data | `lib/services/mockData.ts` | Development test data |
| Copilot Service | `lib/copilot/*` | RAG system, context generation, and LLM integration |

## Data Flow

### 1. Node Data Fetching

```
Browser → useNodes hook → fetchNodes()
                              ↓
         POST /api/prpc → prpcService.fetchNodes()
                              ↓
         Seed pNodes (JSON-RPC: get-pods-with-stats)
                              ↓
         Transform RawPodData → PNode[]
                              ↓
         Cache in TanStack Query (30s stale time)
```

### 2. Geolocation (Lazy Loading)

```
Displayed nodes → useNodeLocations hook
                         ↓
          geoService.getLocation(ipAddress)
                         ↓
      Check localStorage cache → Hit? Return cached
                ↓ Miss
      ip-api.com → Fail? → ipwho.is → Fail? → ipapi.co
                         ↓
      Normalize response → Cache in localStorage
                         ↓
      Update node.location in React state
```

### 3. Alert Subscription

```
User subscribes → POST /api/alerts/subscribe
                         ↓
         Validate email, generate token
                         ↓
         Store in SQLite (alert_subscriptions table)
                         ↓
         Send verification email via Brevo
                         ↓
User verifies → GET /api/alerts/verify?token=xxx
                         ↓
         Mark subscription as verified
```

## Database Schema

SQLite database for alert subscriptions:

```sql
CREATE TABLE alert_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id TEXT NOT NULL,
    email TEXT,
    push_endpoint TEXT,
    push_p256dh TEXT,
    push_auth TEXT,
    alert_offline INTEGER DEFAULT 1,
    alert_score_drop INTEGER DEFAULT 0,
    score_threshold INTEGER DEFAULT 50,
    verified INTEGER DEFAULT 0,
    verification_token TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Status Determination

Node status is calculated relative to the most recently seen node:

| Status | Condition |
|--------|-----------|
| `online` | Seen within 60 seconds of newest |
| `degraded` | Seen within 5 minutes of newest |
| `offline` | Not seen for >5 minutes |

## Health Scoring

### Network Health Score (0-100)

```
Score = (Availability × 0.4) + (Performance × 0.3) + (Storage × 0.3)
```

- **Availability**: Combined online ratio and average uptime
- **Performance**: Inverse of average response time
- **Storage**: Penalty when utilization >90%



## Caching Strategy

| Data | Cache Location | TTL |
|------|----------------|-----|
| Node list | TanStack Query (memory) | 30 seconds |
| Geolocation | localStorage | Permanent |
| Theme preference | localStorage | Permanent |
| Historical data | TanStack Query (memory) | 5 minutes |

## Error Handling

- **API Failures**: Retry with exponential backoff
- **Seed Node Failover**: Try multiple seed IPs
- **Geolocation Fallback**: Chain of 3 providers
- **UI Error States**: `ErrorState` component with retry button
