/**
 * Documentation Sync API Route
 * Downloads all Xandeum documentation from docs.xandeum.network
 * Accepts ANY HTTP method (GET, POST, HEAD, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DOC_URLS = [
    'https://docs.xandeum.network/introduction.md',
    'https://docs.xandeum.network/the-blockchain-storage-trilemma.md',
    'https://docs.xandeum.network/xandeums-scalable-storage-solution.md',
    'https://docs.xandeum.network/v08-reinheim.md',
    'https://docs.xandeum.network/core-concepts.md',
    'https://docs.xandeum.network/xandeum-greenpaper.md',
    'https://docs.xandeum.network/original-xandeum-whitepaper.md',
    'https://docs.xandeum.network/operator-guides.md',
    'https://docs.xandeum.network/validator-home.md',
    'https://docs.xandeum.network/xandeum-pnode-setup-guide.md',
    'https://docs.xandeum.network/register-your-pnode.md',
    'https://docs.xandeum.network/onboard-your-pnode.md',
    'https://docs.xandeum.network/pnode-update-version.md',
    'https://docs.xandeum.network/old-server-housekeeping.md',
    'https://docs.xandeum.network/ports-setup.md',
    'https://docs.xandeum.network/setup-your-disks.md',
    'https://docs.xandeum.network/install-validator-software.md',
    'https://docs.xandeum.network/setup-system-service.md',
    'https://docs.xandeum.network/setup-logrotate.md',
    'https://docs.xandeum.network/starting-your-validator.md',
    'https://docs.xandeum.network/monitoring-your-validator.md',
    'https://docs.xandeum.network/onboarding.md',
    'https://docs.xandeum.network/validator-commands.md',
    'https://docs.xandeum.network/learn-tmux.md',
    'https://docs.xandeum.network/access-your-server.md',
    'https://docs.xandeum.network/validator-update-version.md',
    'https://docs.xandeum.network/faucet-repayment.md',
    'https://docs.xandeum.network/troubleshooting.md',
    'https://docs.xandeum.network/developer-guides.md',
    'https://docs.xandeum.network/v04-herrenberg.md',
    'https://docs.xandeum.network/whats-new-in-herrenberg.md',
    'https://docs.xandeum.network/gossip-protocol.md',
    'https://docs.xandeum.network/reconstructability.md',
    'https://docs.xandeum.network/pnode-rpc.md',
    'https://docs.xandeum.network/search-capabilities.md',
    'https://docs.xandeum.network/foundation-pre-herrenberg.md',
    'https://docs.xandeum.network/erasure-coding.md',
    'https://docs.xandeum.network/v05-ingolstadt.md',
    'https://docs.xandeum.network/whats-new-in-ingolstadt.md',
    'https://docs.xandeum.network/heartbeat-credit-system.md',
    'https://docs.xandeum.network/what-is-a-xandeum-pod.md',
    'https://docs.xandeum.network/foundation-pre-ingolstadt.md',
    'https://docs.xandeum.network/v06-stuttgart.md',
    'https://docs.xandeum.network/whats-new-in-stuttgart.md',
    'https://docs.xandeum.network/redundancy-system.md',
    'https://docs.xandeum.network/v07-heidelberg.md',
    'https://docs.xandeum.network/whats-new-in-heidelberg.md',
];

const DOCS_DIR = path.join(process.cwd(), 'docs', 'xandeum');

async function downloadDoc(url: string): Promise<{ filename: string; success: boolean; error?: string }> {
    const filename = url.split('/').pop() || 'unknown.md';
    const filePath = path.join(DOCS_DIR, filename);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            return { filename, success: false, error: `HTTP ${response.status}` };
        }

        const content = await response.text();
        fs.writeFileSync(filePath, content, 'utf-8');
        return { filename, success: true };
    } catch (error: any) {
        return { filename, success: false, error: error.message };
    }
}

async function syncDocs() {
    // Ensure docs/xandeum directory exists
    if (!fs.existsSync(DOCS_DIR)) {
        fs.mkdirSync(DOCS_DIR, { recursive: true });
    }

    const results = await Promise.all(DOC_URLS.map(downloadDoc));

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        errors: failed.map(f => ({ filename: f.filename, error: f.error })),
    };
}

// Handle ALL HTTP methods
async function handler(request: NextRequest) {
    try {
        console.log(`[docs/sync] Starting sync of ${DOC_URLS.length} documents...`);
        const startTime = Date.now();

        const result = await syncDocs();

        const duration = Date.now() - startTime;
        console.log(`[docs/sync] Completed in ${duration}ms: ${result.successful}/${result.total} successful`);

        return NextResponse.json({
            success: true,
            message: `Synced ${result.successful}/${result.total} documents`,
            duration: `${duration}ms`,
            ...result,
        });
    } catch (error: any) {
        console.error('[docs/sync] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const HEAD = handler;
export const OPTIONS = handler;
