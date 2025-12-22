/**
 * Node Stats API Route
 * Fetches detailed stats from individual pNode using get-stats RPC method
 */

import { NextRequest, NextResponse } from 'next/server';
import http from 'http';

const DEFAULT_RPC_PORT = parseInt(process.env.NEXT_PUBLIC_PNODE_RPC_PORT || '6000', 10);

interface NodeStatsResponse {
    metadata: {
        total_bytes: number;
        total_pages: number;
        last_updated: number;
    };
    stats: {
        cpu_percent: number;
        ram_used: number;
        ram_total: number;
        uptime: number;
        packets_received: number;
        packets_sent: number;
        active_streams: number;
    };
    file_size: number;
}

function httpRequest(ipAddress: string, port: number): Promise<{
    success: boolean;
    data?: NodeStatsResponse;
    error?: string;
}> {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            jsonrpc: '2.0',
            method: 'get-stats',
            id: 1,
        });

        const options: http.RequestOptions = {
            hostname: ipAddress,
            port,
            path: '/rpc',
            method: 'POST',
            timeout: 20000, // 20 second timeout - some nodes are slow
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
            },
        };

        const req = http.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const data = JSON.parse(body);

                    if (data.error) {
                        resolve({
                            success: false,
                            error: `RPC Error: ${JSON.stringify(data.error)}`,
                        });
                        return;
                    }

                    resolve({
                        success: true,
                        data: data.result,
                    });
                } catch (parseError) {
                    resolve({
                        success: false,
                        error: 'Invalid JSON response',
                    });
                }
            });
        });

        req.on('error', (error) => {
            resolve({
                success: false,
                error: error.message,
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                success: false,
                error: 'Request timed out',
            });
        });

        req.write(postData);
        req.end();
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { ipAddress, rpcPort } = body;

        if (!ipAddress) {
            return NextResponse.json(
                { success: false, error: 'IP address is required' },
                { status: 400 }
            );
        }

        const port = rpcPort || DEFAULT_RPC_PORT;
        console.log(`[node-stats] Fetching stats from ${ipAddress}:${port}`);

        const result = await httpRequest(ipAddress, port);

        if (result.success) {
            return NextResponse.json({
                success: true,
                data: result.data,
            });
        }

        // Return 200 with success: false for unreachable nodes
        // This is expected - not all nodes have RPC port open
        return NextResponse.json({
            success: false,
            error: result.error,
            unreachable: true,
        });

    } catch (error: any) {
        const errorMessage = error?.message || 'Unknown error';
        console.error('[node-stats] Error:', errorMessage);

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
