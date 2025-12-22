/**
 * Context Service for Copilot RAG
 * Two-pass retrieval with comprehensive real-time data
 */

import { getDocumentIndex, getDocumentContent, formatIndexForPrompt, DocEntry } from './index';

// Cache to avoid fetching on every request
let cachedLiveData: string | null = null;
let lastDataFetch: number = 0;
const DATA_TTL = 30 * 1000; // 30 seconds

interface NodeData {
    id: string;
    publicKey: string;
    status: string;
    healthScore: number;
    uptime: number;
    version: string;
    ipAddress?: string;
    country?: string;
    storage?: {
        used: number;
        total: number;
    };
}

interface TokenData {
    address: string;
    name: string;
    symbol: string;
    price: number;
    priceChange24h: number;
    priceChange7d: number;
    priceChange30d: number;
    marketCap: number;
    fdv: number;
    liquidity: number;
    volume24h: number;
    holders: number;
    circulatingSupply: number;
    totalSupply: number;
}

interface CreditsData {
    pods_credits: Array<{ pod_id: string; credits: number }>;
    status: string;
}

async function fetchTokenData(): Promise<TokenData | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/token`);
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error('[context] Error fetching token data:', error);
        return null;
    }
}

// Status thresholds (same as prpcService.ts)
const ONLINE_THRESHOLD_SECONDS = 60;
const DEGRADED_THRESHOLD_SECONDS = 300;

function determineNodeStatus(lastSeenTimestamp: number, maxTimestamp: number): 'online' | 'offline' | 'degraded' {
    const secondsSinceLastSeen = maxTimestamp - lastSeenTimestamp;
    if (secondsSinceLastSeen <= ONLINE_THRESHOLD_SECONDS) {
        return 'online';
    } else if (secondsSinceLastSeen <= DEGRADED_THRESHOLD_SECONDS) {
        return 'degraded';
    }
    return 'offline';
}

// Calculate uptime percentage from seconds with offline penalty (same as prpcService.ts)
function calculateUptimePercent(
    uptimeSeconds: number,
    status: string,
    lastSeenTimestamp: number,
    maxTimestamp: number
): number {
    const DAY_IN_SECONDS = 86400;
    let baseUptime = Math.min(100, (uptimeSeconds / DAY_IN_SECONDS) * 100);

    if (status !== 'online') {
        const offlineSeconds = maxTimestamp - lastSeenTimestamp;
        const penalty = (offlineSeconds / DAY_IN_SECONDS) * 100;
        baseUptime = Math.max(0, baseUptime - penalty);
    }

    return Math.round(baseUptime * 10) / 10;
}

// Calculate health score (same as prpcService.ts)
function calculateHealthScore(pod: any, status: 'online' | 'offline' | 'degraded'): number {
    let score = 0;

    // Status weight (40%)
    if (status === 'online') score += 40;
    else if (status === 'degraded') score += 20;

    // Uptime weight (30%)
    const uptimeHours = (pod.uptime || 0) / 3600;
    const uptimeScore = Math.min(30, (uptimeHours / 24) * 30);
    score += uptimeScore;

    // Storage health (20%)
    if (pod.storage_committed && pod.storage_committed > 0) {
        score += 10;
        const usagePercent = pod.storage_usage_percent || 0;
        if (usagePercent < 80) score += 10;
        else if (usagePercent < 95) score += 5;
    }

    // Version/completeness (10%)
    if (pod.version && pod.version !== 'unknown') score += 5;
    if (pod.pubkey) score += 5;

    return Math.round(score);
}

// Generate unique ID from pubkey and address (same as prpcService.ts)
function generateUniqueId(pubkey: string | null, address: string): string {
    if (!pubkey) return 'unknown-' + Math.random().toString(36).substring(2, 8);
    // Combine first 8 chars of pubkey with a hash of the address for uniqueness
    const addrHash = address.split(':')[0].split('.').slice(-2).join('');
    return `${pubkey.substring(0, 8)}-${addrHash}`;
}

async function fetchNodeData(): Promise<NodeData[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/prpc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method: 'get-pods-with-stats' })
        });
        if (!res.ok) return [];
        const data = await res.json();

        // API returns data.pods, transform to our NodeData format
        const pods = data.data?.pods || [];

        // Find max timestamp in dataset (same as dashboard does)
        const maxTimestamp = pods.reduce((max: number, pod: any) => {
            const ts = pod.last_seen_timestamp || 0;
            return ts > max ? ts : max;
        }, 0);

        return pods.map((pod: any) => {
            // Extract IP from address (format: "IP:PORT")
            const ipAddress = pod.address?.split(':')[0];
            const lastSeenTs = pod.last_seen_timestamp || 0;
            const status = determineNodeStatus(lastSeenTs, maxTimestamp);
            const uptimePercent = calculateUptimePercent(pod.uptime || 0, status, lastSeenTs, maxTimestamp);
            const healthScore = calculateHealthScore(pod, status);
            // Generate proper node ID for links (same format as dashboard)
            const nodeId = generateUniqueId(pod.pubkey, pod.address || '');

            return {
                id: nodeId,
                publicKey: pod.pubkey,
                status,
                healthScore,
                uptime: uptimePercent,
                version: pod.version || 'unknown',
                ipAddress,
                storage: {
                    used: pod.storage_used || 0,
                    total: pod.storage_committed || 0,
                }
            };
        });
    } catch (error) {
        console.error('[context] Error fetching node data:', error);
        return [];
    }
}

// Fetch geo data for a list of IPs (batch request to ip-api.com)
async function fetchGeoDataBatch(ips: string[]): Promise<Map<string, string>> {
    const ipToCountry = new Map<string, string>();
    if (ips.length === 0) return ipToCountry;

    try {
        // ip-api.com supports batch requests (up to 100)
        const batchIps = ips.slice(0, 100);
        const res = await fetch('http://ip-api.com/batch?fields=query,country', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batchIps)
        });

        if (!res.ok) {
            console.warn('[context] Geo batch request failed');
            return ipToCountry;
        }

        const data = await res.json();
        for (const item of data) {
            if (item.country) {
                ipToCountry.set(item.query, item.country);
            }
        }
        console.log(`[context] Got geo data for ${ipToCountry.size} IPs`);
    } catch (error) {
        console.error('[context] Error fetching geo data:', error);
    }

    return ipToCountry;
}

async function fetchCreditsData(): Promise<CreditsData | null> {
    try {
        const res = await fetch('https://podcredits.xandeum.network/api/pods-credits');
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error('[context] Error fetching credits data:', error);
        return null;
    }
}

function formatNumber(num: number): string {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(2)} ${units[i]}`;
}

// Map page paths to friendly descriptions
function getPageDescription(path: string | undefined): string {
    if (!path) return 'the Dashboard';

    const pageMap: Record<string, string> = {
        '/': 'the Dashboard (overview of all nodes)',
        '/map': 'the Network Map (geographic view of nodes)',
        '/leaderboard': 'the Leaderboard (top performing nodes)',
        '/analytics': 'the Analytics page (network statistics)',
        '/compare': 'the Compare page (node comparison tool)',
        '/trade': 'the Trade page (XAND token info)',
    };

    // Check for node details page
    if (path.startsWith('/nodes/')) {
        const nodeId = path.replace('/nodes/', '');
        return `viewing node details for: ${nodeId}`;
    }

    return pageMap[path] || `page: ${path}`;
}

async function getLiveData(): Promise<string> {
    const now = Date.now();

    if (cachedLiveData && (now - lastDataFetch) < DATA_TTL) {
        console.log('[context] Using cached live data');
        return cachedLiveData;
    }

    console.log('[context] Fetching fresh live data...');

    // Fetch all data in parallel
    const [tokenData, nodes, creditsData] = await Promise.all([
        fetchTokenData(),
        fetchNodeData(),
        fetchCreditsData()
    ]);

    // Log what we got
    console.log(`[context] Fetched: ${nodes.length} nodes, token: ${!!tokenData}, credits: ${creditsData?.pods_credits?.length || 0}`);
    if (nodes.length > 0) {
        const totalStorage = nodes.reduce((sum, n) => sum + (n.storage?.total || 0), 0);
        console.log(`[context] Total storage from nodes: ${formatBytes(totalStorage)}`);
    }

    let dataContext = '=== REAL-TIME DATA ===\n';
    dataContext += `Data fetched at: ${new Date().toISOString()}\n\n`;

    // Token/XAND Data
    if (tokenData) {
        dataContext += `--- XAND TOKEN ---
Price: $${tokenData.price.toFixed(8)}
24h: ${tokenData.priceChange24h >= 0 ? '+' : ''}${tokenData.priceChange24h.toFixed(2)}%
7d: ${tokenData.priceChange7d >= 0 ? '+' : ''}${tokenData.priceChange7d.toFixed(2)}%
Market Cap: $${formatNumber(tokenData.marketCap)}
Volume (24h): $${formatNumber(tokenData.volume24h)}
Holders: ${formatNumber(tokenData.holders)}

`;
    }

    // Network/Node Data
    if (nodes.length > 0) {
        const online = nodes.filter(n => n.status === 'online').length;
        const degraded = nodes.filter(n => n.status === 'degraded').length;
        const offline = nodes.filter(n => n.status === 'offline').length;
        const avgHealth = nodes.reduce((sum, n) => sum + (n.healthScore || 0), 0) / nodes.length;
        const avgUptime = nodes.reduce((sum, n) => sum + (n.uptime || 0), 0) / nodes.length;

        // Calculate total network storage capacity
        const totalStorageBytes = nodes.reduce((sum, n) => sum + (n.storage?.total || 0), 0);
        const totalStorageUsedBytes = nodes.reduce((sum, n) => sum + (n.storage?.used || 0), 0);

        // Merge credits data with nodes
        const creditsMap = new Map<string, number>();
        if (creditsData?.pods_credits) {
            for (const pc of creditsData.pods_credits) {
                creditsMap.set(pc.pod_id, pc.credits);
            }
        }

        // Enhance nodes with credits
        const nodesWithCredits = nodes.map(n => ({
            ...n,
            credits: creditsMap.get(n.publicKey) || 0
        }));

        // Get top 5 nodes by CREDITS (not health) - these are the best for staking
        const topNodesByCredits = [...nodesWithCredits]
            .filter(n => n.status === 'online' && n.credits > 0)
            .sort((a, b) => b.credits - a.credits)
            .slice(0, 5);

        dataContext += `--- NETWORK STATUS ---
Total pNodes: ${nodes.length}
Online: ${online} | Degraded: ${degraded} | Offline: ${offline}
Avg Health: ${avgHealth.toFixed(1)}/100
Avg Uptime (24h): ${avgUptime.toFixed(1)}%
Network Capacity: ${formatBytes(totalStorageBytes)}
Storage Used: ${formatBytes(totalStorageUsedBytes)}

--- TOP NODES FOR STAKING (by Credits) ---
${topNodesByCredits.map((n, i) => `${i + 1}. ${n.id} - Credits: ${formatNumber(n.credits)}, Health: ${n.healthScore}, Uptime (24h): ${n.uptime.toFixed(1)}%`).join('\n')}

--- ALL NODES DATA (for comparison queries) ---
${nodesWithCredits.map(n => `${n.id}: status=${n.status}, credits=${formatNumber(n.credits)}, health=${n.healthScore}, uptime_24h=${n.uptime.toFixed(1)}%, storage=${formatBytes(n.storage?.total || 0)}`).join('\n')}

NOTE: Node IDs like "XKZpmT4L-248235" can be linked as /nodes/XKZpmT4L-248235

`;

        // Fetch geo data for country distribution
        const uniqueIPs = [...new Set(nodes.map(n => n.ipAddress).filter(Boolean))] as string[];
        const geoData = await fetchGeoDataBatch(uniqueIPs);

        if (geoData.size > 0) {
            // Build country distribution
            const countryCount: Record<string, number> = {};
            for (const node of nodes) {
                if (node.ipAddress) {
                    const country = geoData.get(node.ipAddress);
                    if (country) {
                        countryCount[country] = (countryCount[country] || 0) + 1;
                    }
                }
            }

            // Sort by count and get top countries
            const sortedCountries = Object.entries(countryCount)
                .sort((a, b) => b[1] - a[1]);

            dataContext += `--- GEOGRAPHIC DISTRIBUTION ---
Nodes by Country (${Object.keys(countryCount).length} countries total):
${sortedCountries.slice(0, 15).map(([country, count]) => `- ${country}: ${count} nodes`).join('\n')}
${sortedCountries.length > 15 ? `... and ${sortedCountries.length - 15} more countries` : ''}

`;
        }
    }

    // Credits Data (summary only)
    if (creditsData && creditsData.pods_credits) {
        const credits = creditsData.pods_credits.filter(p => p.credits > 0);
        if (credits.length > 0) {
            const total = credits.reduce((a, b) => a + b.credits, 0);
            const avg = total / credits.length;
            const max = Math.max(...credits.map(c => c.credits));
            const threshold = max * 0.8 * 0.95; // Approx threshold

            dataContext += `--- CREDITS ---
Nodes with Credits: ${credits.length}
Total: ${formatNumber(total)}
Average: ${formatNumber(avg)}
Reward Threshold (est.): ${formatNumber(threshold)}

`;
        }
    }

    cachedLiveData = dataContext;
    lastDataFetch = now;
    return dataContext;
}

export function getDocSelectionPrompt(userQuestion: string): string {
    const index = getDocumentIndex();
    const formattedIndex = formatIndexForPrompt(index);

    return `You are a document retrieval assistant. Given a user question, select the most relevant documents from the index below.

USER QUESTION: "${userQuestion}"

DOCUMENT INDEX:
${formattedIndex}

INSTRUCTIONS:
1. Select 1-5 documents that are MOST relevant to answering the user's question.
2. Return ONLY the filenames, one per line.
3. If no documents are relevant (e.g., the question is about live data/stats), return "NONE".
4. Do not include any explanation, just the filenames.

SELECTED DOCUMENTS:`;
}

export function parseSelectedDocs(response: string): string[] {
    if (response.trim().toUpperCase() === 'NONE') {
        return [];
    }

    const lines = response.split('\n');
    const filenames: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        const match = trimmed.match(/([a-zA-Z0-9_-]+\.md)/);
        if (match) {
            filenames.push(match[1]);
        }
    }

    return filenames.slice(0, 5);
}

export function loadSelectedDocs(filenames: string[]): string {
    if (filenames.length === 0) {
        return '';
    }

    let content = '\n--- DOCUMENTATION ---\n';

    for (const filename of filenames) {
        const docContent = getDocumentContent(filename);
        if (docContent) {
            content += `\n=== ${filename} ===\n${docContent}`;
        }
    }

    return content;
}

// Core system prompt with conversational tone and topic restrictions
function getBaseSystemPrompt(currentPage?: string): string {
    const pageContext = currentPage
        ? `The user is currently on ${getPageDescription(currentPage)}.`
        : '';

    return `You are the Xandeum Copilot - a helpful, friendly assistant for the Xandeum Network analytics dashboard.

${pageContext}

PERSONALITY:
- Be conversational and friendly, like a helpful colleague
- Keep responses SHORT and direct - no essays for simple questions
- Use casual language but stay professional
- Answer in 1-3 sentences when possible, expand only if needed
- Use bullet points for lists, avoid walls of text

TOPIC RESTRICTIONS (CRITICAL):
- You ONLY discuss Xandeum-related topics: network, pNodes, XAND token, staking, STOINC, credits, this dashboard
- If asked about OTHER topics (crypto prices, other blockchains, general questions, coding help, etc.), politely redirect to Xandeum
- Example response for off-topic: "I'm focused on Xandeum! Is there something about the network or your nodes I can help with?"
- NEVER provide information about other cryptocurrencies, blockchains, or unrelated topics

CONTEXT AWARENESS:
- When the user asks about "this node" or "my node" while on a node details page, use the node ID from the page context
- Offer relevant tips based on the current page they're viewing
- Be aware of what data is visible on their current page

RESPONSE STYLE:
- For simple questions: Give a direct answer, maybe one follow-up sentence
- For complex questions: Brief intro, then bullet points or short paragraphs
- For data questions: Give the numbers with minimal fluff
- Always be accurate with the real-time data provided

NODE RECOMMENDATIONS:
- For "best nodes to stake" questions, rank by CREDITS (not health) - credits determine reward share
- Always include credits, uptime, and health in recommendations
- Node IDs are in format like "XKZpmT4L-248235" - just include these in your response
- The client automatically converts node IDs to clickable links

AVAILABLE ACTIONS:
- Users can copy your responses, regenerate them, or edit their messages
- Don't mention these features unless asked
`;
}

export async function getSystemContext(selectedDocs: string[] = [], currentPage?: string): Promise<string> {
    const liveData = await getLiveData();
    const docsContent = loadSelectedDocs(selectedDocs);
    const basePrompt = getBaseSystemPrompt(currentPage);

    return `${basePrompt}

${liveData}

${docsContent}

Remember: Keep it short, stay on topic (Xandeum only), and be helpful!`;
}

export async function getQuickContext(currentPage?: string): Promise<string> {
    const liveData = await getLiveData();
    const basePrompt = getBaseSystemPrompt(currentPage);

    return `${basePrompt}

${liveData}

Remember: Keep it short, stay on topic (Xandeum only), and be helpful!`;
}
