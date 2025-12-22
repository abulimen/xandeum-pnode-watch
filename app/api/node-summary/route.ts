'use server';

import { NextRequest, NextResponse } from 'next/server';

const LONGCAT_API_KEY = process.env.LONGCAT_API_KEY || '';
const LONGCAT_API_URL = process.env.LONGCAT_API_URL || 'https://api.longcat.chat/openai/v1/chat/completions';

export interface NodeSummaryData {
    generatedAt: string;
    title: string;
    content: string;
    recommendation: string;
}

// Cache for node summaries (10 min TTL per node)
const summaryCache: Map<string, { data: NodeSummaryData; timestamp: number }> = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest) {
    try {
        const { node, networkStats } = await req.json();

        if (!node || !node.id) {
            return NextResponse.json({ error: 'Node data required' }, { status: 400 });
        }

        // Check cache
        const cached = summaryCache.get(node.id);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return NextResponse.json(cached.data);
        }

        // Generate AI summary
        const summary = await generateNodeSummary(node, networkStats);

        // Cache the result
        summaryCache.set(node.id, { data: summary, timestamp: Date.now() });

        return NextResponse.json(summary);
    } catch (error) {
        console.error('[node-summary] Error:', error);
        return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
    }
}

async function generateNodeSummary(node: any, networkStats: any): Promise<NodeSummaryData> {
    const prompt = `You are a network analyst for Xandeum, a decentralized storage network. Analyze the following pNode data and provide a brief, personalized summary.

NODE DATA:
- Node ID: ${node.id?.substring(0, 12)}...
- Status: ${node.status}
- Uptime (24h): ${node.uptime?.toFixed(1)}%
- Health Score: ${node.healthScore}/100
- Credits: ${node.credits?.toLocaleString() || 0}
- Storage: ${formatBytes(node.storage?.used || 0)} used of ${formatBytes(node.storage?.total || 0)}
- Version: ${node.version || 'Unknown'}
- Location: ${node.location?.city || 'Unknown'}, ${node.location?.country || 'Unknown'}
- Reward Eligible: ${node.credits >= (networkStats?.creditsThreshold || 50000) ? 'Yes' : 'No'}

NETWORK CONTEXT (for comparison):
- Average Uptime: ${networkStats?.avgUptime?.toFixed(1) || 'N/A'}%
- Average Health: ${networkStats?.avgHealth?.toFixed(1) || 'N/A'}/100
- Total Nodes: ${networkStats?.totalNodes || 'N/A'}

INSTRUCTIONS:
1. Write 2-3 sentences analyzing this specific node's performance relative to the network.
2. Use **bold** for key metrics and positive/negative indicators.
3. Be encouraging but honest about areas needing improvement.
4. Provide one specific actionable recommendation.

Respond ONLY with valid JSON in this format:
{
  "title": "Node Analysis",
  "content": "Brief analysis with **bold** highlights...",
  "recommendation": "One specific actionable tip..."
}`;

    try {
        const response = await fetch(LONGCAT_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${LONGCAT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'LongCat-Flash-Chat',
                messages: [
                    { role: 'system', content: 'You are a helpful AI assistant that analyzes network node data.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`LongCat API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in AI response');

        const aiResponse = JSON.parse(jsonMatch[0]);

        return {
            generatedAt: new Date().toISOString(),
            title: aiResponse.title || 'Node Analysis',
            content: aiResponse.content || 'Analysis unavailable.',
            recommendation: aiResponse.recommendation || 'Monitor node health regularly.'
        };

    } catch (error) {
        console.error('[node-summary] AI generation failed:', error);

        // Fallback without AI
        const isGood = node.healthScore >= 80 && node.uptime >= 95;
        return {
            generatedAt: new Date().toISOString(),
            title: 'Node Analysis',
            content: isGood
                ? `This node is performing **well** with **${node.uptime?.toFixed(1)}% uptime** and a **health score of ${node.healthScore}/100**. Storage utilization is at **${((node.storage?.used / node.storage?.total) * 100 || 0).toFixed(1)}%**.`
                : `This node has **${node.uptime?.toFixed(1)}% uptime** and a **health score of ${node.healthScore}/100**. There may be room for improvement in performance.`,
            recommendation: isGood
                ? 'Continue maintaining current uptime to maximize reward eligibility.'
                : 'Consider checking connectivity and ensuring the node stays online consistently.'
        };
    }
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
