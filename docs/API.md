# API Reference

Complete API documentation for the Xandeum pNode Analytics Platform.

## Table of Contents

1. [pNode RPC API](#pnode-rpc-api)
2. [Internal API Routes](#internal-api-routes)
3. [Alert API](#alert-api)
4. [Geolocation APIs](#geolocation-apis)
5. [Error Handling](#error-handling)

---

## pNode RPC API

The platform connects to Xandeum pNode seed nodes via JSON-RPC.

### Connection Configuration

| Parameter | Default | Environment Variable |
|-----------|---------|---------------------|
| Seed IPs | (required) | `NEXT_PUBLIC_PNODE_SEED_IPS` |
| RPC Port | `6000` | `NEXT_PUBLIC_PNODE_RPC_PORT` |
| RPC Endpoint | `/rpc` | `NEXT_PUBLIC_PNODE_RPC_ENDPOINT` |

### `get-pods-with-stats`

Retrieves all pNodes (pods) with statistics.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "get-pods-with-stats",
  "id": 1
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "pods": [
      {
        "address": "192.168.1.100:9001",
        "pubkey": "5abc123def456...",
        "version": "v0.7.3",
        "last_seen_timestamp": 1702339200,
        "is_public": true,
        "rpc_port": 6000,
        "storage_committed": 1099511627776,
        "storage_used": 549755813888,
        "storage_usage_percent": 50.0,
        "uptime": 86400
      }
    ],
    "total_count": 176
  },
  "error": null
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `address` | `string` | IP:Port format |
| `pubkey` | `string\|null` | Public key (node identifier) |
| `version` | `string` | Software version |
| `last_seen_timestamp` | `number` | Unix timestamp (seconds) |
| `is_public` | `boolean\|null` | Public metrics exposed |
| `rpc_port` | `number\|null` | RPC port |
| `storage_committed` | `number\|null` | Committed storage (bytes) |
| `storage_used` | `number\|null` | Used storage (bytes) |
| `storage_usage_percent` | `number\|null` | Utilization percentage |
| `uptime` | `number\|null` | Uptime in seconds |

### `get-stats`

Fetches detailed stats from individual node (direct connection).

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "get-stats",
  "id": 1
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "metadata": {
      "total_bytes": 549755813888,
      "total_pages": 134217728,
      "last_updated": 1702339200
    },
    "stats": {
      "cpu_percent": 25.5,
      "ram_used": 4294967296,
      "ram_total": 17179869184,
      "uptime": 86400,
      "packets_received": 1000000,
      "packets_sent": 500000,
      "active_streams": 10
    }
  }
}
```

---

## Internal API Routes

### POST `/api/prpc`

Proxies requests to seed nodes.

**Request:**
```json
{
  "method": "get-pods-with-stats"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pods": [...],
    "total_count": 176
  },
  "responseTime": 1234,
  "seedIP": "173.212.203.145"
}
```

### POST `/api/node-stats`

Fetches stats from specific node.

**Request:**
```json
{
  "ipAddress": "192.168.1.100",
  "rpcPort": 6000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metadata": {...},
    "stats": {...}
  }
}
```

### GET `/api/history/network`

Fetches historical network data.

**Query Parameters:**
- `range`: `24h`, `7d`, or `30d`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2024-12-14T00:00:00Z",
      "totalNodes": 176,
      "onlineNodes": 165,
      "avgUptime": 95.5
    }
  ]
}
```

### GET `/api/solana`

Fetches Solana blockchain data.

**Response:**
```json
{
  "success": true,
  "data": {
    "slot": 123456789,
    "blockHeight": 123456789,
    "epoch": 123,
    "epochProgress": 45.5
  }
}
```

### GET `/api/credits`

Fetches pNode credit data from the Xandeum Credits API.

**Response:**
```json
{
  "status": "success",
  "pods_credits": [
    {
      "pod_id": "5abc...",
      "credits": 12345.67
    }
  ]
}
```

### GET `/api/token`

Fetches XAND token data from Jupiter API.

**Response:**
```json
{
  "address": "XAND...",
  "name": "Xandeum",
  "symbol": "XAND",
  "price": 0.003,
  "priceChange24h": 5.2,
  "marketCap": 1000000,
  "volume24h": 50000
}
```

### GET `/api/xandsol`

Fetches XANDSOL token data and staking metrics.

**Response:**
```json
{
  "address": "XAnDe...",
  "name": "XANDSOL",
  "symbol": "XANDSOL",
  "price": 150.00,
  "solPrice": 145.00,
  "stakingAPY": 15.0,
  "exchangeRate": 1.03,
  "lastUpdated": "2024-12-21T00:00:00Z"
}
```

---

## Alert API

### POST `/api/alerts/subscribe`

Subscribe to alerts for a node.

**Request:**
```json
{
  "nodeId": "abc12345",
  "email": "user@example.com",
  "alertOffline": true,
  "alertUptimeDrop": false,
  "uptimeThreshold": 90,
  "alertVersionChange": false,
  "pushSubscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "p256dh": "...",
    "auth": "..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription created. Please verify your email.",
  "requiresVerification": true
}
```

### GET `/api/alerts/verify`

Verify email subscription.

**Query Parameters:**
- `token`: Verification token from email

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### POST `/api/alerts/unsubscribe`

Unsubscribe from alerts.

**Request:**
```json
{
  "email": "user@example.com",
  "nodeId": "abc12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Unsubscribed successfully"
}
```

---

## Geolocation APIs

The platform uses multiple providers with failover:

### 1. ip-api.com (Primary)

- **Rate Limit:** 45 requests/minute
- **Endpoint:** `http://ip-api.com/json/{ip}`

```json
{
  "status": "success",
  "country": "Germany",
  "countryCode": "DE",
  "region": "NW",
  "regionName": "North Rhine-Westphalia",
  "city": "Düsseldorf",
  "lat": 51.2217,
  "lon": 6.7762,
  "timezone": "Europe/Berlin",
  "isp": "Hetzner Online GmbH"
}
```

### 2. ipwho.is (Fallback 1)

- **Rate Limit:** 10,000 requests/month
- **Endpoint:** `https://ipwho.is/{ip}`

### 3. ipapi.co (Fallback 2)

- **Rate Limit:** 1,000 requests/day
- **Endpoint:** `https://ipapi.co/{ip}/json/`

### Caching

Geolocation data is cached in localStorage permanently to minimize API calls.

---

## Node Status Determination

Status is calculated relative to the most recently seen node:

| Status | Condition |
|--------|-----------|
| `online` | Seen within 60 seconds of newest |
| `degraded` | Seen within 5 minutes of newest |
| `offline` | Not seen for >5 minutes |

---

## Error Handling

All API responses include error information:

**Error Response:**
```json
{
  "success": false,
  "error": "Request timed out",
  "data": null
}
```

**Common Errors:**

| Error | Cause |
|-------|-------|
| `Request timed out` | Node didn't respond in time |
| `RPC Error: {...}` | Node returned RPC error |
| `Invalid JSON response` | Malformed data from node |
| `All seed nodes failed` | No seeds reachable |
| `Email already subscribed` | Duplicate subscription |
| `Invalid verification token` | Expired or wrong token |

---

## Rate Limiting

| Endpoint | Rate Limit |
|----------|------------|
| `/api/prpc` | No limit (internal) |
| `/api/alerts/*` | 10 requests/minute |
| Geolocation APIs | See provider limits |

---

## TypeScript Types

```typescript
// Raw pod data from pRPC
interface RawPodData {
  address: string;
  pubkey: string | null;
  version: string;
  last_seen_timestamp: number;
  is_public: boolean | null;
  rpc_port: number | null;
  storage_committed: number | null;
  storage_used: number | null;
  storage_usage_percent: number | null;
  uptime: number | null;
}

// Processed node for frontend
interface PNode {
  id: string;
  publicKey: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  uptimeSeconds: number;
  responseTime: number;
  healthScore: number;
  storage: {
    total: number;
    used: number;
    usagePercent: number;
  };
  location?: {
    country: string;
    countryCode: string;
    region: string;
    city?: string;
    coordinates?: { lat: number; lng: number };
  };
  lastSeen: string;
  version: string;
  isPublic: boolean;
  network: {
    ipAddress: string;
    port: number;
    rpcPort: number;
  };
  network: {
    ipAddress: string;
    port: number;
    rpcPort: number;
  };
  versionStatus?: 'current' | 'outdated' | 'unknown';
  versionType?: 'mainnet' | 'trynet' | 'devnet' | 'unknown';
  uptimeBadge?: 'elite' | 'reliable' | 'average' | 'unreliable';
}
```

---

## Configuration

Environment variables for API layer:

```env
# Seed nodes (required)
NEXT_PUBLIC_PNODE_SEED_IPS=173.212.203.145,65.109.29.154,95.216.148.118

# RPC configuration
NEXT_PUBLIC_PNODE_RPC_PORT=6000
NEXT_PUBLIC_PNODE_RPC_ENDPOINT=/rpc

# Development mode
NEXT_PUBLIC_USE_MOCK_DATA=false

# Email notifications (Brevo)
BREVO_API_KEY=your-api-key
ALERT_FROM_EMAIL=alerts@domain.com
ALERT_FROM_NAME=pNode Watch

# Push notifications (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:your@email.com

# Base URL for email links
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```
