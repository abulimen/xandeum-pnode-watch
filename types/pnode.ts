/**
 * Core PNode type definitions for the pNode Watch Platform
 * Updated to match the actual pRPC API response
 */

// Raw pod data from the pRPC API (get-pods-with-stats)
export interface RawPodData {
  address: string; // IP:Port format
  pubkey: string | null;
  version: string;
  last_seen_timestamp: number; // Unix timestamp in seconds
  is_public: boolean | null;
  rpc_port: number | null;
  storage_committed: number | null; // bytes
  storage_used: number | null; // bytes
  storage_usage_percent: number | null;
  uptime: number | null; // seconds
}

// API response structure
export interface PodListResponse {
  jsonrpc: string;
  id: number;
  result: {
    pods: RawPodData[];
    total_count: number;
  };
  error: string | null;
}

// Geolocation data from ip-api.com
export interface GeoLocation {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  query: string; // IP address
}

// Processed PNode for frontend use
export interface PNode {
  id: string; // Short ID derived from pubkey
  publicKey: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number; // percentage 0-100 (calculated from uptime seconds)
  uptimeSeconds: number; // raw uptime in seconds
  responseTime: number; // milliseconds (measured during fetch)
  healthScore: number; // 0-100 calculated score
  storage: {
    total: number; // bytes (storage_committed)
    used: number; // bytes (storage_used)
    usagePercent: number;
  };
  location?: {
    country: string;
    countryCode: string;
    region: string;
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  lastSeen: string; // ISO timestamp
  lastSeenTimestamp: number; // Unix timestamp
  version: string;
  isPublic: boolean;
  network: {
    ipAddress: string;
    port: number;
    rpcPort: number;
  };
  // Staking-related computed fields (added by enrichNodesWithStakingData)
  credits?: number; // Official credits from Xandeum API (heartbeat-based)
  stakingScore?: number; // Deprecated: keeping for backward compatibility during migration
  versionStatus?: 'current' | 'outdated' | 'unknown';
  versionType?: 'mainnet' | 'trynet' | 'devnet' | 'unknown';
  uptimeBadge?: 'elite' | 'reliable' | 'average' | 'unreliable';
}

// Network statistics aggregated from all nodes
export interface NetworkStats {
  totalNodes: number;
  onlineNodes: number;
  offlineNodes: number;
  degradedNodes: number;
  avgUptime: number;
  avgResponseTime: number;
  totalStorage: number; // bytes
  usedStorage: number; // bytes
  storageUtilization: number; // percentage
  publicNodes: number;
  privateNodes: number;
  versionDistribution: Record<string, number>;
  healthScore: number;
  avgHealthScore: number;
  avgCredits: number; // Average credits from Xandeum API
  avgStakingScore: number; // Deprecated: keeping for backward compatibility
  totalCredits: number; // Total credits across all nodes
  creditsThreshold: number; // 80% of 95th percentile (reward eligibility)
  eliteNodes: number; // Nodes with 99.5%+ uptime
  timestamp: string;
}

// For compatibility with existing code
export interface PNodeListResponse {
  success: boolean;
  data: {
    nodes: PNode[];
    total: number;
  };
  timestamp: string;
  responseTime: number; // How long the API took to respond
}

// Helper type for raw data compatibility
export interface RawPNodeData extends RawPodData { }
